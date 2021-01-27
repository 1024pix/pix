const Joi = require('joi');

const sequenceStartAt = 1;
// Max 32 bits signed integer, our most common id type in Postgres
const sequencesEndsAt = 2 ** 31 - 1;
const idSpecification = Joi.number().integer().min(sequenceStartAt).max(sequencesEndsAt).required();
const userId = idSpecification;

module.exports = {
  idSpecification,
  userId,
};
