import Joi from 'joi';

import { convertJoiToJsonSchema } from '../../../../../../src/devcomp/infrastructure/datasources/conversion/joi-to-json-schema.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Infrastructure | Datasources | Conversion | joi-to-json-schema', function () {
  it('should throw if not Joi', function () {
    const error = catchErrSync(convertJoiToJsonSchema)({});

    expect(error.message).to.equal('Not a Joi schema');
  });

  describe('boolean', function () {
    it('should convert Joi.boolean to JSON Schema', function () {
      const joiSchema = Joi.boolean();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'boolean' });
    });
  });

  describe('string', function () {
    it('should convert Joi.string to JSON Schema', function () {
      const joiSchema = Joi.string();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'string' });
    });

    it('should convert Joi.string.min to JSON Schema with minLength', function () {
      const joiSchema = Joi.string().min(8);
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'string', minLength: 8 });
    });

    it('should convert Joi.string.max to JSON Schema with maxLength', function () {
      const joiSchema = Joi.string().max(32);
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'string', maxLength: 32 });
    });

    it('should convert Joi.string.email to JSON Schema with format email', function () {
      const joiSchema = Joi.string().email();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'string', format: 'email' });
    });

    it('should convert Joi.string.uri to JSON Schema with format uri', function () {
      const joiSchema = Joi.string().uri();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'string', format: 'uri' });
    });

    it('should convert Joi.string.guid to JSON Schema with format uuid', function () {
      const joiSchema = Joi.string().guid({ version: 'uuidv4' });
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'string', format: 'uuid' });
    });

    describe('regex', function () {
      it('should convert Joi.string.regex(d) to JSON Schema with converted pattern', function () {
        const joiSchema = Joi.string().regex(/^\d+$/);
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).to.deep.equal({ type: 'string', pattern: '^[0-9]+$' });
      });

      it('should convert Joi.string.regex(*) to JSON Schema with given pattern', function () {
        const joiSchema = Joi.string().regex(/^[a-z0-9-]+$/);
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).to.deep.equal({ type: 'string', pattern: '^[a-z0-9-]+$' });
      });

      it('should convert Joi.string.regex(*, invert) to JSON Schema with no pattern', function () {
        const joiSchema = Joi.string().regex(/<.*?>/, { invert: true });
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).to.deep.equal({ type: 'string' });
      });

      it('should convert Joi.string.regex.message to JSON Schema with errorMessage', function () {
        const joiSchema = Joi.string().regex(/abc/).message('{{:#label}} failed custom validation');
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).to.deep.equal({
          type: 'string',
          pattern: 'abc',
          errorMessage: '{{:#label}} failed custom validation',
        });
      });
    });

    describe('allow', function () {
      it('should convert Joi.string.allow(empty) to JSON Schema with no enum', function () {
        const joiSchema = Joi.string().allow('');
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).to.deep.equal({ type: 'string' });
      });

      it('should convert Joi.string.allow(*) to JSON Schema with enum', function () {
        const joiSchema = Joi.string().allow('Hello');
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).to.deep.equal({ type: 'string', enum: ['Hello'] });
      });
    });

    describe('external', function () {
      describe('htmlValidation', function () {
        it('should convert Joi.string.external(htmlValidation) to JSON Schema with format jodit', function () {
          // eslint-disable-next-line no-empty-function
          function htmlValidation() {}
          const joiSchema = Joi.string().external(htmlValidation);

          const jsonSchema = convertJoiToJsonSchema(joiSchema);

          expect(jsonSchema).to.deep.equal({ type: 'string', format: 'jodit' });
        });
      });
    });
  });

  describe('number', function () {
    it('should convert Joi.number to JSON Schema', function () {
      const joiSchema = Joi.number();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'number' });
    });

    it('should convert Joi.number.integer to JSON Schema with type integer', function () {
      const joiSchema = Joi.number().integer();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'integer' });
    });

    it('should convert Joi.number.positive to JSON Schema with minimum 1', function () {
      const joiSchema = Joi.number().positive();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'number', minimum: 1 });
    });

    it('should convert Joi.number.negative to JSON Schema with maximum -1', function () {
      const joiSchema = Joi.number().negative();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'number', maximum: -1 });
    });

    it('should convert Joi.number.min to JSON Schema with minimum', function () {
      const joiSchema = Joi.number().min(0);
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'number', minimum: 0 });
    });

    it('should convert Joi.number.max to JSON Schema with maximum', function () {
      const joiSchema = Joi.number().max(150);
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'number', maximum: 150 });
    });
  });

  describe('array', function () {
    it('should convert Joi.array to JSON Schema', function () {
      const joiSchema = Joi.array();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'array' });
    });

    it('should convert Joi.array.min to JSON Schema with minItems', function () {
      const joiSchema = Joi.array().min(3);
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'array', minItems: 3 });
    });

    it('should convert Joi.array.unique to JSON Schema with uniqueItems', function () {
      const joiSchema = Joi.array().unique();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({ type: 'array', uniqueItems: true });
    });

    describe('items', function () {
      it('should convert Joi.array.items(string) to JSON Schema with items string', function () {
        const joiSchema = Joi.array().items(Joi.string());
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).to.deep.equal({ type: 'array', items: { type: 'string' } });
      });

      it('should convert Joi.array.items(number) to JSON Schema with items number', function () {
        const joiSchema = Joi.array().items(Joi.number());
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).to.deep.equal({ type: 'array', items: { type: 'number' } });
      });

      it('should convert Joi.array.items(object) to JSON Schema with items object', function () {
        const joiSchema = Joi.array().items(Joi.object());
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).to.deep.equal({ type: 'array', items: { type: 'object' } });
      });

      it('should convert Joi.array.items(array) to JSON Schema with items array', function () {
        const joiSchema = Joi.array().items(Joi.array());
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).to.deep.equal({ type: 'array', items: { type: 'array' } });
      });
    });
  });

  describe('object', function () {
    it('should convert Joi.object to JSON Schema', function () {
      const joiSchema = Joi.object();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(joiSchema.validate({ name: 'John', age: 30, additional: 'property' }).error).to.be.undefined;
      expect(jsonSchema).to.deep.equal({ type: 'object' });
    });

    it('should convert Joi.object.keys to JSON Schema with no additionalProperties', function () {
      const joiSchema = Joi.object({});
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(joiSchema.validate({ additional: 'property' }).error).not.to.be.undefined;
      expect(jsonSchema).to.deep.equal({ type: 'object', additionalProperties: false });
    });

    it('should convert Joi.object.keys.unknown to JSON Schema with additionalProperties', function () {
      const joiSchema = Joi.object({}).unknown();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(joiSchema.validate({ additional: 'property' }).error).to.be.undefined;
      expect(jsonSchema).to.deep.equal({ type: 'object', additionalProperties: true });
    });

    it('should convert Joi.object.keys to JSON Schema with properties', function () {
      const joiSchema = Joi.object({
        name: Joi.string(),
        age: Joi.number(),
      });
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        additionalProperties: false,
      });
    });

    it('should convert Joi.object.keys.required to JSON Schema with required properties', function () {
      const joiSchema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number(),
      });
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name'],
        additionalProperties: false,
      });
    });

    it('should convert Joi.object with nested Joi.object to nested JSON Schema', function () {
      const joiSchema = Joi.object({
        address: Joi.object({
          street: Joi.string(),
          city: Joi.string(),
        }),
      });
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({
        type: 'object',
        properties: {
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      });
    });

    it('should convert Joi.object with nested Joi.array to nested JSON Schema', function () {
      const joiSchema = Joi.object({
        addresses: Joi.array().items(Joi.string()),
      });
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).to.deep.equal({
        type: 'object',
        properties: {
          addresses: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      });
    });
  });

  describe('alternatives', function () {
    it('should convert Joi.alternatives.try to JSON Schema', function () {
      const joiSchema = Joi.alternatives().try(Joi.string(), Joi.number());

      const jsonSchema = convertJoiToJsonSchema(joiSchema);

      expect(joiSchema.validate('string').error).to.be.undefined;
      expect(joiSchema.validate(123).error).to.be.undefined;
      expect(jsonSchema).to.deep.equal({ oneOf: [{ type: 'string' }, { type: 'number' }] });
    });

    describe('Joi.alternatives.conditional', function () {
      it('should convert conditional deep ref switch is/then to JSON Schema', function () {
        const joiSchema = Joi.alternatives().conditional('.sport', {
          switch: [
            {
              is: 'handball',
              then: Joi.object({
                sport: Joi.string().valid('handball').required(),
                value: Joi.string().required(),
              }),
            },
            {
              is: 'volleyball',
              then: Joi.object({
                sport: Joi.string().valid('volleyball').required(),
                value: Joi.number().required(),
              }),
            },
          ],
        });

        const jsonSchema = convertJoiToJsonSchema(joiSchema);

        expect(joiSchema.validate({ sport: 'handball', value: 'hello' }).error).to.be.undefined;
        expect(joiSchema.validate({ sport: 'volleyball', value: 132 }).error).to.be.undefined;
        expect(jsonSchema).to.deep.equal({
          oneOf: [
            {
              additionalProperties: false,
              properties: {
                sport: {
                  enum: ['handball'],
                  type: 'string',
                },
                value: {
                  type: 'string',
                },
              },
              required: ['sport', 'value'],
              type: 'object',
            },
            {
              additionalProperties: false,
              properties: {
                sport: {
                  enum: ['volleyball'],
                  type: 'string',
                },
                value: {
                  type: 'number',
                },
              },
              required: ['sport', 'value'],
              type: 'object',
            },
          ],
        });
      });

      it('should convert conditional deep ref switch is/then to JSON Schema and add title if a .type property exists', function () {
        const joiSchema = Joi.alternatives().conditional('.type', {
          switch: [
            {
              is: 'handball',
              then: Joi.object({
                type: Joi.string().valid('handball').required(),
                value: Joi.string().required(),
              }),
            },
            {
              is: 'volleyball',
              then: Joi.object({
                type: Joi.string().valid('volleyball').required(),
                value: Joi.number().required(),
              }),
            },
          ],
        });

        const jsonSchema = convertJoiToJsonSchema(joiSchema);

        expect(joiSchema.validate({ type: 'handball', value: 'hello' }).error).to.be.undefined;
        expect(joiSchema.validate({ type: 'volleyball', value: 132 }).error).to.be.undefined;
        expect(jsonSchema).to.deep.equal({
          oneOf: [
            {
              title: 'handball',
              additionalProperties: false,
              properties: {
                type: {
                  enum: ['handball'],
                  type: 'string',
                },
                value: {
                  type: 'string',
                },
              },
              required: ['type', 'value'],
              type: 'object',
            },
            {
              title: 'volleyball',
              additionalProperties: false,
              properties: {
                type: {
                  enum: ['volleyball'],
                  type: 'string',
                },
                value: {
                  type: 'number',
                },
              },
              required: ['type', 'value'],
              type: 'object',
            },
          ],
        });
      });
    });
  });
});
