package main

import (
	"context"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var ginLambda *ginadapter.GinLambda

// Item represents a generic item in our application
type Item struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// In-memory "database" for demonstration
var items = []Item{
	{ID: "1", Name: "Laptop"},
	{ID: "2", Name: "Monitor"},
	{ID: "3", Name: "Keyboard"},
}

// getItems responds with the list of all items as JSON.
func getItems(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, items)
}

func main() {
	log.Println("Starting up Gin server")
	r := gin.Default()

	// Configure CORS to allow requests from any origin
	r.Use(cors.Default())

	r.GET("/items", getItems)

	// Add a simple health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "UP"})
	})

	ginLambda = ginadapter.New(r)

	// Check if running in Lambda environment
	if ginLambda != nil {
		log.Println("Running on AWS Lambda")
		lambda.Start(Handler)
	} else {
		log.Println("Running locally")
		if err := r.Run(":8080"); err != nil {
			log.Fatalf("Failed to run server: %v", err)
		}
	}
}

// Handler is the Lambda function handler
func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return ginLambda.ProxyWithContext(ctx, req)
}
