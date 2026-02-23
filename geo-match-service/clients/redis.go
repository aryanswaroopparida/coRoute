package client

import (
	"coroute/geomatch/config"
	"github.com/redis/go-redis/v9"
	"log"
)

func initRedisClient() {
	opts, err := redis.ParseURL(config.GetConfig().Database.Redis.URI)
	if err != nil {
		log.Println("Error in connecting to redis " + err.Error())
	}
	c.RedisClient = redis.NewClient(opts)
	log.Println("Connected to redis")
}
