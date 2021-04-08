const jwt = require('jsonwebtoken');
const AuthError = require('../errors/auth-error');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    const error = new AuthError('Необходима авторизация');
    next(error);
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, '394e82e4e9303872fe0cc8e455e59bba18fff712c057ae47408105167bb31248');
  } catch (err) {
    const error = new AuthError('Необходима авторизация');
    next(error);
  }
  req.user = payload;
  return next();
};
