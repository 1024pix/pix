const Joi = require('@hapi/joi');

// Min 32 bits signed integer, our most common id type in Postgres
const minId = -(2 ** 31);
// Max 32 bits signed integer, our most common id type in Postgres
const maxId = 2 ** 31 - 1;

module.exports = {
  idSpecification: Joi.number().integer().min(minId).max(maxId).required(),
};
