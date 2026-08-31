import { expect } from 'chai';
import Joi from 'joi';

import { createObjectQuerySchema } from '../../../../../src/shared/application/query-schema/object-query-schema.js';

describe('Unit | Application | bracket-or-json-query-schema', function () {
  const valueSchema = Joi.object({ foo: Joi.string().required() });
  const schema = createObjectQuerySchema({
    paramName: 'test-param',
    valueSchema,
  });

  describe('when the value already matches the value schema (bracket notation)', function () {
    it('accepts it as is', function () {
      // when
      const { error, value } = schema.validate({ foo: 'bar' });

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal({ foo: 'bar' });
    });

    it('propagates the value schema error when it does not match', function () {
      // when
      const { error } = schema.validate({ foo: 42 });

      // then
      expect(error).to.exist;
      expect(error.message).to.equal('"foo" must be a string');
    });
  });

  describe('when the value is a JSON-encoded string', function () {
    it('parses it and validates it against the value schema', function () {
      // when
      const { error, value } = schema.validate('{"foo":"bar"}');

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal({ foo: 'bar' });
    });

    it('rejects a string that is not valid JSON, with a message naming the param and explaining the parsing failure', function () {
      // when
      const { error } = schema.validate('not-json');

      // then
      expect(error).to.exist;
      expect(error.message).to.contain('"test-param" must be a valid JSON string');
      expect(error.message).to.contain('not valid JSON');
    });

    it('rejects a parsed value that breaks the value schema, propagating the underlying Joi message', function () {
      // when
      const { error } = schema.validate('{"foo":42}');

      // then
      expect(error).to.exist;
      expect(error.message).to.equal('"foo" must be a string');
    });
  });

  describe('error message propagation', function () {
    it('propagates the exact same message whether the violation comes from the object form or the JSON-encoded form', function () {
      // when
      const objectError = schema.validate({ foo: 42 }).error;
      const jsonStringError = schema.validate('{"foo":42}').error;

      // then
      expect(objectError.message).to.equal(jsonStringError.message);
    });
  });
});
