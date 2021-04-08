const CastError = require('./cast-error');
const ValidationError = require('./validation-error');
const AuthError = require('./auth-error');
const ForbiddenError = require('./forbidden-error');
const DocumentNotFoundError = require('./document-not-found-error');
const MongoDuplicateEmailError = require('./mongo-duplicate-email-error');
const ServerError = require('./server-error');

const errorHandler = (err, next, objErrorMessages) => {
  const {
    CastErrorMessage,
    ValidationErrorMessage,
    AuthErrorMessage,
    DocumentNotFoundErrorMessage,
    MongoDuplicateEmailErrorMessage,
  } = objErrorMessages;
  let error;
  if (err.name === 'CastError') {
    error = new CastError(CastErrorMessage);
  } else if (err.name === 'ValidationError') {
    error = new ValidationError(ValidationErrorMessage);
  } else if (err.name === 'AuthError') {
    error = new AuthError(AuthErrorMessage);
  } else if (err.name === 'ForbiddenError') {
    error = new ForbiddenError(err.message);
  } else if (err.name === 'DocumentNotFoundError') {
    error = new DocumentNotFoundError(DocumentNotFoundErrorMessage);
  } else if (err.name === 'MongoError' && err.code === 11000) {
    error = new MongoDuplicateEmailError(MongoDuplicateEmailErrorMessage);
  } else {
    error = new ServerError(err.message);
  }
  next(error);
};

module.exports = errorHandler;
