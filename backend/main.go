// backend/main.go

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Item struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	DailyRate   float64 `json:"dailyRate"`
	ImageURL    string  `json:"imageUrl"`
}

var jwtKey = []byte("your_secret_key")
var db *dynamodb.DynamoDB
var itemsTableName string
var usersTableName string

func init() {
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))
	db = dynamodb.New(sess)
	itemsTableName = os.Getenv("ITEMS_TABLE_NAME")
	usersTableName = os.Getenv("USERS_TABLE_NAME")
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Trim the path to handle potential inconsistencies
	path := strings.Trim(request.Path, "/")

	// This is a simple router
	if request.HTTPMethod == "GET" && path == "items" {
		return getItemsHandler(request)
	}
	if request.HTTPMethod == "POST" && path == "register" {
		return registerHandler(request)
	}
	if request.HTTPMethod == "POST" && path == "login" {
		return loginHandler(request)
	}
	if request.HTTPMethod == "POST" && path == "items" {
		return addItemHandler(request)
	}

	return clientError(404, "Not Found")
}

// All other functions (getItemsHandler, registerHandler, etc.) remain the same.
// Just ensure they are present in your file.

func getItemsHandler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	result, err := db.Scan(&dynamodb.ScanInput{
		TableName: aws.String(itemsTableName),
	})
	if err != nil {
		return serverError(err)
	}
	var items []Item
	err = dynamodbattribute.UnmarshalListOfMaps(result.Items, &items)
	if err != nil {
		return serverError(err)
	}
	body, err := json.Marshal(items)
	if err != nil {
		return serverError(err)
	}
	return successfulResponse(string(body))
}

func registerHandler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var user User
	if err := json.Unmarshal([]byte(request.Body), &user); err != nil {
		return serverError(err)
	}
	if user.Email == "" || user.Name == "" || user.Password == "" {
		return clientError(400, "All fields are required")
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return serverError(err)
	}
	user.Password = string(hashedPassword)
	av, err := dynamodbattribute.MarshalMap(user)
	if err != nil {
		return serverError(err)
	}
	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String(usersTableName),
	}
	_, err = db.PutItem(input)
	if err != nil {
		return serverError(err)
	}
	return successfulResponse(`{"message": "User registered successfully"}`)
}

func loginHandler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var creds User
	if err := json.Unmarshal([]byte(request.Body), &creds); err != nil {
		return clientError(400, "Invalid request body")
	}
	result, err := db.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String(usersTableName),
		Key: map[string]*dynamodb.AttributeValue{
			"email": {
				S: aws.String(creds.Email),
			},
		},
	})
	if err != nil {
		return serverError(err)
	}
	if result.Item == nil {
		return clientError(401, "Invalid credentials")
	}
	var user User
	if err = dynamodbattribute.UnmarshalMap(result.Item, &user); err != nil {
		return serverError(err)
	}
	if err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(creds.Password)); err != nil {
		return clientError(401, "Invalid credentials")
	}
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &jwt.RegisteredClaims{
		Subject:   user.Email,
		ExpiresAt: jwt.NewNumericDate(expirationTime),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return serverError(err)
	}
	responseBody, _ := json.Marshal(map[string]string{"token": tokenString})
	return successfulResponse(string(responseBody))
}

func addItemHandler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var item Item
	if err := json.Unmarshal([]byte(request.Body), &item); err != nil {
		return serverError(err)
	}
	item.ID = fmt.Sprintf("item_%d", time.Now().UnixNano())
	av, err := dynamodbattribute.MarshalMap(item)
	if err != nil {
		return serverError(err)
	}
	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String(itemsTableName),
	}
	if _, err = db.PutItem(input); err != nil {
		return serverError(err)
	}
	body, err := json.Marshal(item)
	if err != nil {
		return serverError(err)
	}
	return successfulResponse(string(body))
}

func successfulResponse(body string) (events.APIGatewayProxyResponse, error) {
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Headers": "*",
			"Access-Control-Allow-Methods": "*",
		},
		Body: body,
	}, nil
}

func serverError(err error) (events.APIGatewayProxyResponse, error) {
	return events.APIGatewayProxyResponse{
		StatusCode: 500,
		Headers: map[string]string{
			"Access-Control-Allow-Origin": "*",
		},
		Body: err.Error(),
	}, nil
}

func clientError(status int, body string) (events.APIGatewayProxyResponse, error) {
	return events.APIGatewayProxyResponse{
		StatusCode: status,
		Headers: map[string]string{
			"Access-Control-Allow-Origin": "*",
		},
		Body: body,
	}, nil
}

func main() {
	lambda.Start(handler)
}
