package model

import "go.mongodb.org/mongo-driver/v2/bson"

type GeoLocation struct {
	Latitude, Longitude float64
}

type ChatRoomRequest struct {
	People      People
	GeoLocation GeoLocation
}

type People struct {
	Name  string        `json:"name" bson:"name"`
	Email string        `json:"email" bson:"email"`
	Id    bson.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
}

type Chatroom struct {
	Id           bson.ObjectID `json:"chat_room_id,omitempty" bson:"_id,omitempty"`
	ChatRoomName string        `json:"chat_room_name" bson:"name"`
	Members      []People      `json:"people,omitempty" bson:"people"`
}

type ChatRoomResponse struct {
	ChatRooms []*Chatroom
}
