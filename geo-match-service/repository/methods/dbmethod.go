package methods

import (
	"context"
	client "coroute/geomatch/clients"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type DBMethods[T any] interface {
	Create(ctx context.Context, doc *T) error
	UpdateOne(ctx context.Context, filter interface{}, update interface{}) error
	DeleteOne(ctx context.Context, filter interface{}) error
	FindOne(ctx context.Context, filter interface{}) (*T, error)
	FindAll(ctx context.Context, filter interface{}) ([]T, error)
	DeleteAll(ctx context.Context, filter interface{}) error
	UpdateAll(ctx context.Context, filter interface{}, update interface{}) error
}

type MongoRepository[T any] struct {
	collection *mongo.Collection
}

func NewRepository[T any](collectionName string) *MongoRepository[T] {
	return &MongoRepository[T]{
		collection: client.Get().MongoDBClient.Collection(collectionName),
	}
}
