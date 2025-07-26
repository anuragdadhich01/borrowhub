package main

import (
	"encoding/json"
	"fmt"
	"log" // Import the log package
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

// User and Item structs remain the same...
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
	// THIS IS THE NEW DIAGNOSTIC LOGGING
	log.Printf("Handler invoked. Method: %s, Path: %s", request.HTTPMethod, request.Path)

	if request.HTTPMethod == "OPTIONS" {
		log.Println("Handling OPTIONS preflight request")
		return successfulResponse("")
	}

	path := strings.Trim(request.Path, "/")
	pathParts := strings.Split(path, "/")
	resource := pathParts[len(pathParts)-1]

	log.Printf("Routing request for resource: %s", resource)

	switch request.HTTPMethod {
	case "GET":
		if resource == "items" {
			return getItemsHandler(request)
		}
	case "POST":
		switch resource {
		case "register":
			return registerHandler(request)
		case "login":
			return loginHandler(request)
		case "items":
			return addItemHandler(request)
		}
	}

	log.Printf("No route found for %s %s", request.HTTPMethod, request.Path)
	return clientError(404, "Not Found")
}

// All other functions (successfulResponse, getItemsHandler, etc.) remain the same...
// --- Response Helpers ---
func successfulResponse(body string) (events.APIGatewayProxyResponse, error) {
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Headers": "Content-Type,Authorization",
			"Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
		},
		Body: body,
	}, nil
}
func clientError(status int, body string) (events.APIGatewayProxyResponse, error) {
	return events.APIGatewayProxyResponse{
		StatusCode: status,
		Headers:    map[string]string{"Access-Control-Allow-Origin": "*"},
		Body:       fmt.Sprintf(`{"message":"%s"}`, body),
	}, nil
}
func serverError(err error) (events.APIGatewayProxyResponse, error) {
	log.Printf("Server Error: %s", err.Error()) // Add logging for server errors
	return events.APIGatewayProxyResponse{
		StatusCode: 500,
		Headers:    map[string]string{"Access-Control-Allow-Origin": "*"},
		Body:       err.Error(),
	}, nil
}

// --- Handler Functions ---
func getItemsHandler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	log.Println("Executing getItemsHandler")
	result, err := db.Scan(&dynamodb.ScanInput{TableName: aws.String(itemsTableName)})
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
	log.Println("Executing registerHandler")
	var user User
	if err := json.Unmarshal([]byte(request.Body), &user); err != nil {
		return serverError(err)
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
	_, err = db.PutItem(&dynamodb.PutItemInput{Item: av, TableName: aws.String(usersTableName)})
	if err != nil {
		return serverError(err)
	}
	return successfulResponse(`{"message": "User registered successfully"}`)
}
func loginHandler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	log.Println("Executing loginHandler")
	var creds User
	if err := json.Unmarshal([]byte(request.Body), &creds); err != nil {
		return clientError(400, "Invalid request body")
	}
	result, err := db.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String(usersTableName),
		Key:       map[string]*dynamodb.AttributeValue{"email": {S: aws.String(creds.Email)}},
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
	claims := &jwt.RegisteredClaims{Subject: user.Email, ExpiresAt: jwt.NewNumericDate(expirationTime)}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte("your_secret_key"))
	if err != nil {
		return serverError(err)
	}
	responseBody, _ := json.Marshal(map[string]string{"token": tokenString})
	return successfulResponse(string(responseBody))
}
func addItemHandler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	log.Println("Executing addItemHandler")
	var item Item
	if err := json.Unmarshal([]byte(request.Body), &item); err != nil {
		return serverError(err)
	}
	item.ID = fmt.Sprintf("item_%d", time.Now().UnixNano())
	av, err := dynamodbattribute.MarshalMap(item)
	if err != nil {
		return serverError(err)
	}
	_, err = db.PutItem(&dynamodb.PutItemInput{Item: av, TableName: aws.String(itemsTableName)})
	if err != nil {
		return serverError(err)
	}
	body, err := json.Marshal(item)
	if err != nil {
		return serverError(err)
	}
	return successfulResponse(string(body))
}

func main() {
	lambda.Start(handler)
}
