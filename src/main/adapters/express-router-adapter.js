class ExpressRouterAdapter {
  static adapt(router) {
    return async (req, res) => {
      const httpRequest = {
        body: req.body,
        params: req.params
      }
      const httpResponse = await router(httpRequest)
      return res.status(httpResponse.statusCode).json(httpResponse.body)
    }
  }
}

module.exports = ExpressRouterAdapter
