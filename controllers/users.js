const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.getUsers = (req, res) => User.find({})
  .orFail()
  .then((users) => {
    res.send({ data: users });
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      res.status(400).send({ message: 'Переданы некорректные данные' });
    } else if (err.name === 'DocumentNotFoundError') {
      res.status(404).send({ message: 'Пользователи не найдены' });
    } else {
      res.status(500).send({ message: err.message });
    }
  });

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные' });
      } else if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Пользователь с указанным id не найден' });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

module.exports.createUser = (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  if (!email || !password) {
    res.status(400).send({ message: 'Email или пароль не могут быть пустыми' });
    return;
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
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Ошибка валидации данных' });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

module.exports.getUserData = (req, res) => User.findById(req.user._id)
  .orFail()
  .then((user) => {
    res.send({ data: user });
  })
  .catch((err) => {
    if (err.name === 'DocumentNotFoundError') {
      res.status(404).send({ message: 'Пользователь с указанным id не найден' });
    } else {
      res.status(500).send({ message: err.message });
    }
  });

module.exports.updateUserData = (req, res) => {
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
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные' });
      } else if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Ошибка валидации данных' });
      } else if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Пользователь с указанным id не найден' });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

module.exports.updateUserAvatar = (req, res) => {
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
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные' });
      } else if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Ошибка валидации данных' });
      } else if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Пользователь с указанным id не найден' });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

module.exports.login = (req, res) => {
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
    .catch((err) => res.status(401).send({ message: err.message }));
};
