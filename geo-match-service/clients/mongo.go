package client

import (
	"coroute/geomatch/config"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func initMongoDBClient() {
	mongoClient, err := mongo.Connect(options.Client().ApplyURI(config.GetConfig().Database.MongoDB.URI))
	if err != nil {
		panic("Failed to connect to MongoDB: " + err.Error())
	}
	c.MongoDB = mongoClient
	c.MongoDBClient = c.MongoDB.Database(config.GetConfig().Database.MongoDB.DBName)
}
