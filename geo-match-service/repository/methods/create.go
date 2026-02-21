package methods

import "context"

func (r *MongoRepository[T]) Create(ctx context.Context, doc *T) error {
	_, err := r.collection.InsertOne(ctx, doc)
	return err
}
