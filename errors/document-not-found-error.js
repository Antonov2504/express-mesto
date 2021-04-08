class DocumentNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DocumentNotFoundError';
    this.statusCode = 404;
  }
}

module.exports = DocumentNotFoundError;
