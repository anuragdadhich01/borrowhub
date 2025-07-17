# This Makefile tells AWS SAM how to build our Go function.
# The target name 'build-BorrowHubbFunction' is derived from the function's
# logical ID in template.yaml.

build-BorrowHubbFunction:
	# This command compiles main.go into an executable named 'bootstrap'.
	# GOOS=linux and GOARCH=amd64 ensures it's compiled for the Lambda environment.
	GOOS=linux GOARCH=amd64 go build -o bootstrap main.go
