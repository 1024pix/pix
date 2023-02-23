const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);
const { validateEntity } = require('../validators/entity-validator.js');

const validationSchema = Joi.object({
  id: Joi.number().integer().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthdate: Joi.date().required().allow(null),
  division: Joi.string().required().allow(null),
  group: Joi.string().required().allow(null),
  organizationId: Joi.number().integer().required(),
  organizationName: Joi.string().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
  isDisabled: Joi.boolean().required(),
  canBeDissociated: Joi.boolean().required(),
});

class OrganizationLearnerForAdmin {
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
    organizationIsManagingStudents,
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
    this.canBeDissociated = organizationIsManagingStudents;

    validateEntity(validationSchema, this);
  }
}

module.exports = OrganizationLearnerForAdmin;
