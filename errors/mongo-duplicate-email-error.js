class MongoDuplicateEmailError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MongoDuplicateEmailError';
    this.statusCode = 409;
  }
}

module.exports = MongoDuplicateEmailError;
