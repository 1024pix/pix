const Joi = require('joi').extend(require('@joi/date'));
const { validateEntity } = require('../validators/entity-validator');

const validationSchema = Joi.object({
  id: Joi.number().integer().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthdate: Joi.date().required(),
  division: Joi.string().optional().allow(null),
  group: Joi.string().optional().allow(null),
  organizationId: Joi.number().integer().required(),
  //organizationExternalId: Joi.string().required(),
  organizationName: Joi.string().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
  isDisabled: Joi.boolean().required(),
});

class SchoolingRegistrationForAdmin {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    division,
    group,
    organizationId,
    organizationName,
    createdAt,
    updatedAt,
    isDisabled,
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.division = division;
    this.group = group;
    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isDisabled = isDisabled;

    validateEntity(validationSchema, this);
  }
}

module.exports = SchoolingRegistrationForAdmin;
