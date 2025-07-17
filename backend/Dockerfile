# Stage 1: Build the Go binary using an official Go image
FROM golang:1.21-alpine as builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files first to leverage Docker cache
COPY go.mod go.sum ./
# Download Go dependencies
RUN go mod download

# Copy the rest of your application's source code
COPY . .

# Compile the Go application for a Linux environment.
# CGO_ENABLED=0 is important for cross-compilation.
# The output is named 'bootstrap', which is the required name for a Lambda custom runtime.
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o bootstrap main.go

# ---

# Stage 2: Create the final, minimal Lambda image
FROM public.ecr.aws/lambda/provided:al2

# Copy the compiled binary from the 'builder' stage to the final image.
# The destination is /var/runtime/, which is where Lambda looks for the executable.
COPY --from=builder /app/bootstrap /var/runtime/

# Set the command that Lambda will run when the function is invoked.
CMD [ "/var/runtime/bootstrap" ]