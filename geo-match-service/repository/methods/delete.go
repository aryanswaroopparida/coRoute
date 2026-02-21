package methods

import "context"

func (r *MongoRepository[T]) DeleteOne(ctx context.Context, filter interface{}) error {
	_, err := r.collection.DeleteOne(ctx, filter)
	return err
}

func (r *MongoRepository[T]) DeleteAll(ctx context.Context, filter interface{}) error {
	_, err := r.collection.DeleteMany(ctx, filter)
	return err
}
