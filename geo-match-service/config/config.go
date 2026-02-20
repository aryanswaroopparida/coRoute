package config

import (
	"github.com/joho/godotenv"
	"log"
	"net/url"
	"os"
	"sync"
)

var (
	config = Config{}
	once   = sync.Once{}
)

type Config struct {
	ServiceName string    `json:"ServiceName"`
	Port        string    `json:"Port"`
	PortGrpc    string    `json:"PortGrpc"`
	Database    *database `json:"Database"`
}

type database struct {
	MongoDB *mongoDB `json:"mongoDB"`
	Redis   *redis   `json:"redis"`
}

type redis struct {
	URI string `json:"uri"`
}

type mongoDB struct {
	URI    string `json:"uri"`
	DBName string `json:"dbName"`
}

func LoadEnv() *Config {
	once.Do(func() {
		if err := godotenv.Load(); err != nil {
			log.Println("Error loading .env file")
		}
		mongoUri := getEnv("MONGO_URI", "mongodb://localhost:27017/test")
		u, err := url.Parse(mongoUri)
		if err != nil {
			log.Fatalf("Failed to parse MongoDB URI: %v", err)
		}
		dbName := u.Path[1:]
		//log.Printf("MongoDB DB Name: %v", dbName)
		config = Config{
			ServiceName: getEnv("SERVICE_NAME", ""),
			Port:        getEnv("PORT", "8080"),
			PortGrpc:    getEnv("PORT_GRPC", "8080"),
			Database: &database{
				MongoDB: &mongoDB{
					URI:    mongoUri,
					DBName: dbName,
				},
				Redis: &redis{
					URI: getEnv("REDIS_URI", ""),
				},
			},
		}
	})
	return &config
}

func GetConfig() *Config {
	return &config
}

func getEnv(key, defaultValue string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return defaultValue
}
