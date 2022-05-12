class HttpError extends Error {
  constructor(name, type) {
    super(type)
    this.name = name
  }
}

module.exports = HttpError
