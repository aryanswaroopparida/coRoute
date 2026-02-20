package server

import (
	"context"
	"coroute/geomatch/config"
	"errors"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

type Server interface {
	Start()
	Shutdown(ctx context.Context)
}

type GinServer struct {
	app    *gin.Engine
	server *http.Server
}

func NewGinServer() Server {
	app := gin.Default()
	server := &GinServer{
		app:    app,
		server: &http.Server{Handler: app},
	}
	return server
}

func (s *GinServer) Start() {
	log.Println("Starting Http Server")
	conf := config.GetConfig()
	registerRoutes(s.app)
	log.Println("Starting Http Server on port: ", conf.Port)
	s.server.Addr = ":" + conf.Port
	if err := s.server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		panic("Failed to start Http Server on port: " + conf.Port + " " + err.Error())
	}
}

func (s *GinServer) Shutdown(ctx context.Context) {
	log.Println("Shutting down Http Server")
	if err := s.server.Shutdown(ctx); err != nil {
		log.Println("Failed to shutdown Http Server: " + err.Error())
	}
}

func registerRoutes(engine *gin.Engine) {
	api := engine.Group("/")
	api.Use(gin.Recovery())

	//Use Middleware to check jwt

	//Make for no route Handler
	//engine.NoRoute() -> Pass No Route Handler

}
