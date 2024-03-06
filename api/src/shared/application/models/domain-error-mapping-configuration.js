import Joi from 'joi';

import { validateEntity } from '../../domain/validators/entity-validator.js';

const schema = Joi.object({
  name: Joi.string().required(),
  httpErrorFn: Joi.function().required(),
});

export class DomainErrorMappingConfiguration {
  constructor({ name, httpErrorFn } = {}) {
    this.name = name;
    this.httpErrorFn = httpErrorFn;

    validateEntity(schema, this);
  }
}
