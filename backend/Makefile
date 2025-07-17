# Makefile for the Go backend of BorrowHubb

.PHONY: build-BorrowHubbApiFunction clean

# The name of our final executable
BINARY_NAME=bootstrap

# This target compiles the Go application for the AWS Lambda Linux environment.
# It no longer creates a zip file. SAM will handle that.
build-BorrowHubbApiFunction:
	GOOS=linux GOARCH=amd64 go build -o $(BINARY_NAME) main.go

# The 'clean' target removes the build artifact
clean:
	rm -f $(BINARY_NAME)
