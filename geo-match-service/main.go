package main

import (
	"context"
	client "coroute/geomatch/clients"
	"coroute/geomatch/config"
	"coroute/geomatch/server"
	"os"
	"os/signal"
	"syscall"
)

func init() {
	config.LoadEnv()
}

func main() {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	_, cancel := context.WithCancel(context.Background()) //Will need ctx later
	defer cancel()
	client.Init()
	//Ping Grpc Clients

	svr := server.NewGinServer()
	go svr.Start()

	//No need of workers as of now
	<-quit
	cancel()
}
