// Triggering a new deployment
// Package main is the entry point for our application.
package main

import (
	"net/http"

	"github.com/gin-gonic/gin" // Import the Gin framework
)

// main is the primary function that runs when the application starts.
func main() {
	// 1. Initialize a new Gin router with default middleware.
	// The default middleware includes a logger and a recovery mechanism.
	router := gin.Default()

	// 2. Define a route for the /health endpoint.
	// This is a standard practice for services to report their status.
	// It responds to GET requests.
	router.GET("/health", func(c *gin.Context) {
		// 3. Respond with a JSON object.
		// http.StatusOK is the 200 OK status code.
		// gin.H is a shortcut for map[string]interface{}.
		c.JSON(http.StatusOK, gin.H{
			"status":  "UP",
			"message": "BorrowHubb API is healthy and running!",
		})
	})

	// 4. Start the HTTP server and listen for requests.
	// By default, it listens on all network interfaces at port 8080.
	// If there's an error starting the server, it will panic.
	router.Run(":8080")
}
