package main

import (
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type Item struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	items := []Item{
		{ID: "1", Name: "Classic Novel"},
		{ID: "2", Name: "Power Drill"},
		{ID: "3", Name: "Board Game"},
		{ID: "4", Name: "Tent"},
	}

	body, err := json.Marshal(items)
	if err != nil {
		return events.APIGatewayProxyResponse{Body: "Error marshalling JSON", StatusCode: 500}, nil
	}

	// This is the crucial new part!
	// We are adding a header that allows any origin ('*') to access this API.
	headers := map[string]string{
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Methods": "GET, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	}

	return events.APIGatewayProxyResponse{
		Body:       string(body),
		StatusCode: 200,
		Headers:    headers, // <-- We add the headers here
	}, nil
}

func main() {
	lambda.Start(handler)
}
