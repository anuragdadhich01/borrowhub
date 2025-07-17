package main

import (
	"context"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-gonic/gin"
)

// ginLambda is a global variable that holds our Gin API proxy.
// It's initialized once in the init() function.
var ginLambda *ginadapter.GinLambda

// Item represents a simple data structure for our items.
type Item struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// init runs before the main function. It sets up the Gin router.
func init() {
	// 1. Initialize a new Gin router.
	router := gin.Default()

	// 2. Define a route for GET /items
	// This is the endpoint our frontend will call.
	router.GET("/items", func(c *gin.Context) {
		// Create a slice of Item structs.
		items := []Item{
			{ID: "1", Name: "Laptop"},
			{ID: "2", Name: "Keyboard"},
			{ID: "3", Name: "Mouse"},
		}
		// Respond with the list of items as JSON.
		c.JSON(http.StatusOK, items)
	})

	// 3. Create the Gin Lambda adapter.
	// This adapter translates API Gateway requests into a format Gin can understand.
	ginLambda = ginadapter.New(router)
}

// Handler is the primary function that Lambda will invoke.
// It receives the API Gateway request and passes it to our Gin adapter.
func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return ginLambda.ProxyWithContext(ctx, req)
}

// main is the entry point for the Lambda function.
// It starts the Lambda handler.
func main() {
	lambda.Start(Handler)
}
