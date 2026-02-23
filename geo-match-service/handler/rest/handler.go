package rest

import (
	//"coroute/geomatch/middlewares"
	"github.com/gin-gonic/gin"
)

func RegisterClientAPIHandlers(router *gin.RouterGroup) {
	//mw := middlewares.New() Middleware
	client := router.Group("/v1/client")
	{

	}
}
