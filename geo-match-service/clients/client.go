package client

import (
	"context"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"sync"
)

var (
	c    *client
	once sync.Once
)

type client struct {
	MongoDB       *mongo.Client
	MongoDBClient *mongo.Database
	RedisClient   *redis.Client
	//Later Will Add Kafka RabbitMq & Grpc
}

func Init() {
	once.Do(func() {
		initMongoDBClient()
		initRedisClient()
	})
}

func Close(ctx context.Context) {
	_ = c.MongoDB.Disconnect(ctx)
	_ = c.RedisClient.Close()
	//Close Rest of Clients when needed
}
