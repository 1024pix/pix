import Joi from 'joi';

import { ObjectValidationError } from '../../../../src/shared/domain/errors.js';
import { validateEntity } from '../../../../src/shared/domain/validators/entity-validator.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Domain | Validators | entity-validator', function () {
  describe('#validateEntity', function () {
    context('when entity is valid', function () {
      it('should not throw', function () {
        expect(() => new EntityForValidatorTest({ id: 3, name: 'salut' })).not.to.throw(ObjectValidationError);
      });
    });

    context('when entity is not valid', function () {
      it('should throw', function () {
        expect(() => new EntityForValidatorTest({ id: 'coucou', name: 'salut' })).to.throw(ObjectValidationError);
      });
    });
  });
});

const entitySchemaForValidatorTest = Joi.object({
  id: Joi.number().integer().required(),
  name: Joi.string().required(),
});

class EntityForValidatorTest {
  constructor({ id, name } = {}) {
    this.id = id;
    this.name = name;

    validateEntity(entitySchemaForValidatorTest, this);
  }
}
