package middlewares

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (i *impl) NoRouteHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.String(http.StatusNotFound, "Not Found")
	}
}

func (i *impl) NoMethodHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.String(http.StatusMethodNotAllowed, "Method Not Allowed")
	}
}
