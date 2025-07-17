# Makefile for the Go backend of BorrowHubb

.PHONY: build clean

# The name of our final executable
BINARY_NAME=bootstrap
# The name of our deployment package
ZIP_NAME=bootstrap.zip

# The 'build' target compiles the Go code and creates the zip file
build:
	# Compile the Go application for the AWS Lambda Linux environment
	GOOS=linux GOARCH=amd64 go build -o $(BINARY_NAME) main.go
	# Create a zip archive containing the executable
	zip $(ZIP_NAME) $(BINARY_NAME)

# The 'clean' target removes build artifacts
clean:
	rm -f $(BINARY_NAME) $(ZIP_NAME)
