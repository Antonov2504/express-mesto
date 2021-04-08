const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const errorHandler = require('../errors/error-handler');
const AuthError = require('../errors/auth-error');
const ValidationError = require('../errors/validation-error');

module.exports.getUsers = (req, res, next) => User.find({})
  .orFail()
  .then((users) => {
    res.send({ data: users });
  })
  .catch((err) => {
    errorHandler(err, next, {
      CastErrorMessage: 'Переданы некорректные данные',
      DocumentNotFoundErrorMessage: 'Пользователи не найдены',
    });
  });

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      errorHandler(err, next, {
        CastErrorMessage: 'Переданы некорректные данные',
        DocumentNotFoundErrorMessage: 'Пользователь с указанным id не найден',
      });
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  if (!email || !password) {
    const error = new ValidationError('Email или пароль не могут быть пустыми');
    next(error);
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      res.status(201).send({
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      });
    })
    .catch((err) => {
      errorHandler(err, next, {
        ValidationErrorMessage: 'Ошибка валидации данных',
        MongoDuplicateEmailErrorMessage: 'Пользователь с таким Email уже зарегистрирован',
      });
    });
};

module.exports.getUserData = (req, res, next) => User.findById(req.user._id)
  .orFail()
  .then((user) => {
    res.send({ data: user });
  })
  .catch((err) => {
    errorHandler(err, next, {
      DocumentNotFoundErrorMessage: 'Пользователь с указанным id не найден',
    });
  });

module.exports.updateUserData = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      about,
    },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      errorHandler(err, next, {
        CastErrorMessage: 'Переданы некорректные данные',
        ValidationErrorMessage: 'Ошибка валидации данных',
        DocumentNotFoundErrorMessage: 'Пользователь с указанным id не найден',
      });
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      errorHandler(err, next, {
        CastErrorMessage: 'Переданы некорректные данные',
        ValidationErrorMessage: 'Ошибка валидации данных',
        DocumentNotFoundErrorMessage: 'Пользователь с указанным id не найден',
      });
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        '394e82e4e9303872fe0cc8e455e59bba18fff712c057ae47408105167bb31248',
        { expiresIn: '7d' },
      );
      res.cookie('token', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      });
      res.send({ token });
    })
    .catch((err) => {
      const error = new AuthError(err.message);
      next(error);
    });
};
