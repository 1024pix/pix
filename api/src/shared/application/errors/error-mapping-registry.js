import Joi from 'joi';

import { config } from '../../../../config/config.js';

export class ErrorMappingRegistry {
  #mappingRegistry = [];

  #mappingSchema = Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      httpErrorFn: Joi.function().required(),
    }),
  );

  register(mapping) {
    Joi.assert(mapping, this.#mappingSchema);

    mapping.forEach(({ name, httpErrorFn }) => {
      if (this.#exists(name)) {
        throw new Error(`Error ${name} already mapped`);
      }
      this.#mappingRegistry[name] = httpErrorFn;
    });
  }

  mapToError(ErrorClass) {
    if (this.#mappingRegistry[ErrorClass.name]) {
      return this.#mappingRegistry[ErrorClass.name](ErrorClass);
    }
  }

  #exists(name) {
    return this.#mappingRegistry[name] && config.environment !== 'test';
  }
}
