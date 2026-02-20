package middlewares

import "github.com/gin-gonic/gin"

type Middleware interface {
	NoRouteHandler() gin.HandlerFunc
	NoMethodHandler() gin.HandlerFunc
}

type impl struct{}

func (i *impl) CaptureHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		headers := c.Request.Header
		for key, value := range headers {
			for _, value := range value {
				c.Header(key, value)
			}
		}
		c.Next()
	}
}

func New() Middleware {
	return &impl{}
}
