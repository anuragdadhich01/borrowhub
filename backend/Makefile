build-BorrowHubbFunction:
	go mod tidy
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap main.go
	cp bootstrap $(ARTIFACTS_DIR)
