package config

var config = Config{}

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
