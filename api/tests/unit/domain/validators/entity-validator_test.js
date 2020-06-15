const { expect } = require('../../../test-helper');
const { ObjectValidationError } = require('../../../../lib/domain/errors');
const Joi = require('@hapi/joi');
const { validateEntity } =  require('../../../../lib/domain/validators/entity-validator');

describe('Unit | Domain | Validators | entity-validator', function() {

  describe('#validateEntity', () => {

    context('when entity is valid', () => {
      it('should not throw', () => {
        expect(() => new EntityForValidatorTest({ id: 3, name: 'salut' })).not.to.throw(ObjectValidationError);
      });
    });

    context('when entity is not valid', () => {
      it('should throw', () => {
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
  constructor({
    id,
    name,
  } = {}) {
    this.id = id;
    this.name = name;

    validateEntity(entitySchemaForValidatorTest, this);
  }
}
