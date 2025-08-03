package main

import (
	"context"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// Lambda handler function
func lambdaHandler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Convert API Gateway request to HTTP request
	req, err := apiGatewayRequestToHTTPRequest(request)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers: map[string]string{
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "https://borrowhubb.live",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-Requested-With",
				"Access-Control-Allow-Credentials": "true",
			},
			Body: `{"error": "Failed to process request"}`,
		}, err
	}

	// Create response recorder
	recorder := httptest.NewRecorder()

	// Handle the request using our existing router
	httpHandler.ServeHTTP(recorder, req)

	// Convert HTTP response to API Gateway response
	response := httpResponseToAPIGatewayResponse(recorder)
	
	return response, nil
}

// Convert API Gateway proxy request to standard HTTP request
func apiGatewayRequestToHTTPRequest(request events.APIGatewayProxyRequest) (*http.Request, error) {
	// Build URL with path and query parameters
	path := request.Path
	if request.PathParameters != nil {
		// Replace path parameters (e.g., {id} -> actual value)
		for key, value := range request.PathParameters {
			path = strings.Replace(path, "{"+key+"}", value, -1)
		}
	}

	// Add query parameters
	queryValues := url.Values{}
	for key, value := range request.QueryStringParameters {
		queryValues.Set(key, value)
	}
	for key, values := range request.MultiValueQueryStringParameters {
		for _, value := range values {
			queryValues.Add(key, value)
		}
	}

	fullURL := "https://example.com" + path
	if len(queryValues) > 0 {
		fullURL += "?" + queryValues.Encode()
	}

	// Create HTTP request
	req, err := http.NewRequest(request.HTTPMethod, fullURL, strings.NewReader(request.Body))
	if err != nil {
		return nil, err
	}

	// Set headers
	for key, value := range request.Headers {
		req.Header.Set(key, value)
	}
	for key, values := range request.MultiValueHeaders {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	// Set request context with API Gateway context
	req = req.WithContext(context.WithValue(req.Context(), "apiGatewayContext", request.RequestContext))

	return req, nil
}

// Convert HTTP response to API Gateway proxy response
func httpResponseToAPIGatewayResponse(recorder *httptest.ResponseRecorder) events.APIGatewayProxyResponse {
	headers := make(map[string]string)
	multiValueHeaders := make(map[string][]string)

	for key, values := range recorder.Header() {
		if len(values) == 1 {
			headers[key] = values[0]
		} else {
			multiValueHeaders[key] = values
		}
	}

	// Ensure CORS headers are always present
	if headers["Access-Control-Allow-Origin"] == "" {
		headers["Access-Control-Allow-Origin"] = "https://borrowhubb.live"
	}
	if headers["Access-Control-Allow-Methods"] == "" {
		headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
	}
	if headers["Access-Control-Allow-Headers"] == "" {
		headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, X-Requested-With"
	}
	if headers["Access-Control-Allow-Credentials"] == "" {
		headers["Access-Control-Allow-Credentials"] = "true"
	}

	return events.APIGatewayProxyResponse{
		StatusCode:        recorder.Code,
		Headers:           headers,
		MultiValueHeaders: multiValueHeaders,
		Body:              recorder.Body.String(),
	}
}

// Start Lambda if in Lambda environment
func startLambdaIfNeeded() {
	if os.Getenv("AWS_LAMBDA_RUNTIME_API") != "" {
		// Start Lambda handler
		log.Println("BorrowHub backend starting as Lambda function")
		log.Printf("Database: %s\n", appConfig.Database.Type)
		log.Println("Sample users:")
		log.Println("- john@example.com / password123")
		log.Println("- jane@example.com / password123")
		log.Println("- admin@borrowhub.com / password123 (Admin)")
		
		lambda.Start(lambdaHandler)
	}
}