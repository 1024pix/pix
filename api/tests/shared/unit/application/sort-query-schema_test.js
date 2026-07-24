import { createSortQuerySchema } from '../../../../src/shared/application/sort-query-schema.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Application | sort-query-schema', function () {
  describe('when no sort is provided', function () {
    it('leaves the value undefined', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error, value } = schema.validate(undefined);

      // then
      expect(error).to.not.exist;
      expect(value).to.be.undefined;
    });
  });

  describe('when sort is an array (bracket notation)', function () {
    it('accepts an empty array', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error, value } = schema.validate([]);

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal([]);
    });

    it('accepts an item with both value and type', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error, value } = schema.validate([{ value: 'lastName', type: 'asc' }]);

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal([{ value: 'lastName', type: 'asc' }]);
    });

    it('accepts an item with only a value', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error, value } = schema.validate([{ value: 'lastName' }]);

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal([{ value: 'lastName' }]);
    });

    it('rejects an item missing a value', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error } = schema.validate([{ type: 'asc' }]);

      // then
      expect(error).to.exist;
      expect(error.message).to.equal('"[0].value" is required');
    });

    it('treats a null type as absent', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error, value } = schema.validate([{ value: 'lastName', type: null }]);

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal([{ value: 'lastName' }]);
    });

    it('treats an empty string type as absent', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error, value } = schema.validate([{ value: 'lastName', type: '' }]);

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal([{ value: 'lastName' }]);
    });

    it('rejects an empty string value', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error } = schema.validate([{ value: '', type: 'asc' }]);

      // then
      expect(error).to.exist;
      expect(error.message).to.equal('"[0].value" is required');
    });

    it('accepts several sort items', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error, value } = schema.validate([
        { value: 'lastName', type: 'asc' },
        { value: 'firstName', type: 'desc' },
      ]);

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal([
        { value: 'lastName', type: 'asc' },
        { value: 'firstName', type: 'desc' },
      ]);
    });

    it('rejects a type that is not "asc" or "desc"', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error } = schema.validate([{ value: 'lastName', type: 'invalid' }]);

      // then
      expect(error).to.exist;
    });
  });

  describe('when sort is a JSON-encoded string', function () {
    it('accepts a valid JSON string and parses it into an array', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error, value } = schema.validate('[{"value":"lastName","type":"asc"}]');

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal([{ value: 'lastName', type: 'asc' }]);
    });

    it('rejects a string that is not valid JSON, with a message explaining the JSON parsing failure', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error } = schema.validate('not-json');

      // then
      expect(error).to.exist;
      expect(error.message).to.contain('"sort" must be a valid JSON string');
      expect(error.message).to.contain('not valid JSON');
    });

    it('rejects a parsed array whose type is invalid, with the underlying Joi message', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error } = schema.validate('[{"value":"lastName","type":"invalid"}]');

      // then
      expect(error).to.exist;
      expect(error.message).to.equal('"[0].type" must be one of [asc, desc, null]');
    });

    it('rejects a parsed array item missing a value, with the underlying Joi message', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const { error } = schema.validate('[{"type":"asc"}]');

      // then
      expect(error).to.exist;
      expect(error.message).to.equal('"[0].value" is required');
    });
  });

  describe('error message propagation', function () {
    it('propagates the same precise message whether the invalid type comes from an array or a JSON-encoded string', function () {
      // given
      const schema = createSortQuerySchema();

      // when
      const arrayError = schema.validate([{ value: 'lastName', type: 'invalid' }]).error;
      const jsonStringError = schema.validate('[{"value":"lastName","type":"invalid"}]').error;

      // then
      expect(arrayError.message).to.equal(jsonStringError.message);
    });
  });

  describe('example option', function () {
    it('attaches the provided example to the schema', function () {
      // given
      const example = [{ value: 'lastName', type: 'asc' }];

      // when
      const schema = createSortQuerySchema({ example });

      // then
      expect(schema.describe().examples).to.deep.equal([example]);
    });

    it('set default sort example none is provided', function () {
      // when
      const schema = createSortQuerySchema();

      // then
      expect(schema.describe().examples).to.deep.equal([[[{ value: 'id', type: 'asc' }]]]);
    });
  });
});
