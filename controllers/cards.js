const Card = require('../models/card');
const errorHandler = require('../errors/error-handler');
const ForbiddenError = require('../errors/forbidden-error');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .orFail()
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      errorHandler(err, next, {
        CastErrorMessage: 'Переданы некорректные данные',
        DocumentNotFoundErrorMessage: 'Пользователи не найдены',
      });
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      errorHandler(err, next, {
        CastErrorMessage: 'Переданы некорректные данные',
        ValidationErrorMessage: 'Ошибка валидации данных',
      });
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail()
    .then((card) => {
      if (card.owner.equals(req.user._id)) {
        return Card.findByIdAndRemove(cardId)
          .orFail()
          .then(res.send({ message: 'Карточка удалена' }))
          .catch((err) => {
            errorHandler(err, next, {
              CastErrorMessage: 'Переданы некорректные данные',
              DocumentNotFoundErrorMessage: 'Карточка с указанным id не найдена',
            });
          });
      }
      throw new ForbiddenError('Доступ запрещен. Возможно удаление только собственной карточки');
    })
    .catch((err) => {
      errorHandler(err, next, {
        CastErrorMessage: 'Переданы некорректные данные',
        DocumentNotFoundErrorMessage: 'Карточка с указанным id не найдена',
      });
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      errorHandler(err, next, {
        CastErrorMessage: 'Переданы некорректные данные',
        DocumentNotFoundErrorMessage: 'Карточка с указанным id не найдена',
      });
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      errorHandler(err, next, {
        CastErrorMessage: 'Переданы некорректные данные',
        DocumentNotFoundErrorMessage: 'Карточка с указанным id не найдена',
      });
    });
};
