const Joi = require('@hapi/joi');

// Max 32 bits signed integer, our most common id type in Postgres
const maxId = 2 ** 31 - 1;

module.exports = {
  idSpecification: Joi.number().integer().max(maxId).required(),
};
