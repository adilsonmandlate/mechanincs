class HttpResponse {
  static ok(body) {
    return {
      statusCode: 200,
      body
    }
  }

  static serverError(statusCode, error = '') {
    return {
      statusCode,
      body: {
        error
      }
    }
  }
}

module.exports = HttpResponse
