# This is the build target that `sam build` will run.
# It MUST be named "build-<FunctionLogicalID>" from template.yaml.
build-BorrowHubbFunction:
	# Compile the Go binary for a Linux environment.
	GOOS=linux GOARCH=arm64 go build -o $(ARTIFACTS_DIR)/bootstrap main.go

# .PHONY declares that this is not a real file.
.PHONY: build-BorrowHubbFunction