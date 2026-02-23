package geolocation

import (
	"context"
	"coroute/geomatch/repository/model"
	"sync"
	"time"

	client "coroute/geomatch/clients"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const (
	collectionName = "chatrooms"
	ChatRoomName   = "name"
)

type ChatRoomRepository interface {
	SaveMemberToChatRoom(ctx context.Context, roomID bson.ObjectID, member *model.People) error
	CreateChatRoom(ctx context.Context, chatroom *model.Chatroom) error
}

type impl struct {
	collection *mongo.Collection
}

var once sync.Once

func New() ChatRoomRepository {
	collection := client.Get().MongoDBClient.Collection(collectionName)

	once.Do(func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		indexes := []mongo.IndexModel{
			{
				Keys: bson.M{ChatRoomName: 1},
				Options: options.Index().
					SetName("name_unique").
					SetUnique(true),
			},
		}

		_, err := collection.Indexes().CreateMany(ctx, indexes)
		if err != nil {
			panic(err)
		}
	})

	return &impl{
		collection: collection,
	}
}
