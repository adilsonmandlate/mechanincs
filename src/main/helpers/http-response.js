const HttpError = require('./http-error')

class HttpResponse {
  static ok(body) {
    return {
      statusCode: 200,
      body
    }
  }

  static ServerError() {
    return {
      statusCode: 500,
      body: {
        error: new HttpError('ServerError', 'Internal Error').message
      }
    }
  }
}

module.exports = HttpResponse
