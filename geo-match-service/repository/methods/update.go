package methods

import "context"

func (r *MongoRepository[T]) UpdateOne(ctx context.Context, filter interface{}, update interface{}) error {
	_, err := r.collection.UpdateOne(ctx, filter, update)
	return err
}

func (r *MongoRepository[T]) UpdateAll(ctx context.Context, filter interface{}, update interface{}) error {
	_, err := r.collection.UpdateMany(ctx, filter, update)
	return err
}
