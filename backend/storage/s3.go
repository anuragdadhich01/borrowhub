package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type S3Storage struct {
	client     *s3.Client
	bucketName string
	region     string
}

type UploadResult struct {
	URL      string `json:"url"`
	Key      string `json:"key"`
	FileName string `json:"fileName"`
	Size     int64  `json:"size"`
}

func NewS3Storage() (*S3Storage, error) {
	bucketName := os.Getenv("S3_BUCKET_NAME")
	if bucketName == "" {
		return nil, fmt.Errorf("S3_BUCKET_NAME environment variable is required")
	}

	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "us-east-1" // Default region
	}

	// Load AWS configuration
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg)

	return &S3Storage{
		client:     client,
		bucketName: bucketName,
		region:     region,
	}, nil
}

func (s *S3Storage) UploadFile(ctx context.Context, file multipart.File, header *multipart.FileHeader, folder string) (*UploadResult, error) {
	// Reset file pointer to beginning
	_, err := file.Seek(0, io.SeekStart)
	if err != nil {
		return nil, fmt.Errorf("failed to reset file pointer: %w", err)
	}

	// Read file content
	content, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Validate file type
	contentType := http.DetectContentType(content)
	if !isValidImageType(contentType) {
		return nil, fmt.Errorf("invalid file type: %s", contentType)
	}

	// Generate unique key
	ext := filepath.Ext(header.Filename)
	fileName := fmt.Sprintf("%s_%d%s", 
		strings.TrimSuffix(header.Filename, ext),
		time.Now().UnixNano(),
		ext,
	)
	
	key := fmt.Sprintf("%s/%s", folder, fileName)

	// Upload to S3
	input := &s3.PutObjectInput{
		Bucket:      aws.String(s.bucketName),
		Key:         aws.String(key),
		Body:        bytes.NewReader(content),
		ContentType: aws.String(contentType),
		ACL:         types.ObjectCannedACLPublicRead,
		Metadata: map[string]string{
			"original-filename": header.Filename,
			"uploaded-at":       time.Now().Format(time.RFC3339),
		},
	}

	_, err = s.client.PutObject(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to upload to S3: %w", err)
	}

	// Generate public URL
	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucketName, s.region, key)

	return &UploadResult{
		URL:      url,
		Key:      key,
		FileName: header.Filename,
		Size:     header.Size,
	}, nil
}

func (s *S3Storage) DeleteFile(ctx context.Context, key string) error {
	input := &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	}

	_, err := s.client.DeleteObject(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to delete from S3: %w", err)
	}

	return nil
}

func (s *S3Storage) GetSignedURL(ctx context.Context, key string, duration time.Duration) (string, error) {
	presignClient := s3.NewPresignClient(s.client)

	request, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = duration
	})

	if err != nil {
		return "", fmt.Errorf("failed to create signed URL: %w", err)
	}

	return request.URL, nil
}

func isValidImageType(contentType string) bool {
	validTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}
	return validTypes[contentType]
}

func (s *S3Storage) ListFiles(ctx context.Context, folder string) ([]string, error) {
	input := &s3.ListObjectsV2Input{
		Bucket: aws.String(s.bucketName),
		Prefix: aws.String(folder + "/"),
	}

	result, err := s.client.ListObjectsV2(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to list objects: %w", err)
	}

	var files []string
	for _, obj := range result.Contents {
		files = append(files, *obj.Key)
	}

	return files, nil
}