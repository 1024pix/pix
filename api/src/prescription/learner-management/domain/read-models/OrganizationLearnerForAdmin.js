import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
import { validateEntity } from '../../../../shared/domain/validators/entity-validator.js';
import { IMPORT_KEY_FIELD } from '../constants.js';

const validationSchema = Joi.object({
  id: Joi.number().integer().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthdate: Joi.string().required().allow(null),
  division: Joi.string().required().allow(null),
  group: Joi.string().required().allow(null),
  organizationId: Joi.number().integer().required(),
  organizationName: Joi.string().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
  isDisabled: Joi.boolean().required(),
  canBeDissociated: Joi.boolean().required(),
  additionalInformations: Joi.object().allow(null),
  additionalColumns: Joi.array().items({
    name: Joi.string().required(),
    key: Joi.string().required(),
  }),
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
    additionalInformations = {},
    additionalColumns = [],
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
    this.updateDivisionAndBirthdate({ additionalInformations, additionalColumns });
  }

  updateDivisionAndBirthdate({ additionalInformations, additionalColumns }) {
    const dateOfBirthColumn = additionalColumns.find((column) => column.name === IMPORT_KEY_FIELD.COMMON_BIRTHDATE);
    if (dateOfBirthColumn) {
      this.birthdate = additionalInformations[dateOfBirthColumn.key];
    }
    const divisionColumn = additionalColumns.find((column) => column.name === IMPORT_KEY_FIELD.COMMON_DIVISION);
    if (divisionColumn) {
      this.division = additionalInformations[divisionColumn.key];
    }
  }
}

export { OrganizationLearnerForAdmin };
