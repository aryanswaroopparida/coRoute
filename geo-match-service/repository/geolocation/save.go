package geolocation

import (
	"context"
	"coroute/geomatch/repository/model"
	"fmt"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func (r *impl) CreateChatRoom(
	ctx context.Context,
	chatroom *model.Chatroom,
) error {

	if chatroom.Id.IsZero() {
		chatroom.Id = bson.NewObjectID()
	}

	_, err := r.collection.InsertOne(ctx, chatroom)
	if err != nil {
		// Handle duplicate key error (unique name)
		if mongo.IsDuplicateKeyError(err) {
			return fmt.Errorf("chatroom with same name already exists")
		}
		return err
	}

	return nil
}

func (r *impl) SaveMemberToChatRoom(
	ctx context.Context,
	roomID bson.ObjectID,
	member *model.People,
) error {
	
	filter := bson.M{
		"_id": roomID,
	}

	update := bson.M{
		"$addToSet": bson.M{
			"members": member,
		},
	}

	result, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}
