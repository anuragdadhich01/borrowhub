# Makefile for the Go backend of BorrowHubb

.PHONY: build-BorrowHubbApiFunction

# This target compiles the Go application for the AWS Lambda Linux environment.
build-BorrowHubbApiFunction:
	# 1. Compile the Go application into an executable named 'bootstrap'
	GOOS=linux GOARCH=amd64 go build -o bootstrap main.go
	# 2. FIXED: Move the compiled executable into the special artifacts directory
	#    that AWS SAM provides via the $(ARTIFACTS_DIR) environment variable.
	#    This is the crucial step that ensures SAM packages the correct file.
	mv bootstrap $(ARTIFACTS_DIR)
