package server

import (
	"context"
	"github.com/gin-gonic/gin"
	"net/http"
)

type Server interface {
	Start(ctx context.Context)
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

func (g *GinServer) Start(ctx context.Context) {
	log := logger.F
}

func (g *GinServer) Shutdown(ctx context.Context) {

}
