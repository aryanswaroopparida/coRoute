package geolocation

import (
	"context"
	"coroute/geomatch/repository/model"
)

type GeoLocation interface {
	FindAndAddToChatRoom(ctx context.Context, people *model.People) error
}
