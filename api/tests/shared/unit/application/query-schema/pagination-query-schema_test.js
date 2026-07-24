import { pageQuerySchema } from '../../../../../src/shared/application/query-schema/pagination-query-schema.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Application | pagination-query-schema', function () {
  describe('when no page is provided', function () {
    it('defaults to an empty object', function () {
      // when
      const { error, value } = pageQuerySchema.validate(undefined);

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal({});
    });
  });

  describe('page validation rules (object form)', function () {
    it('accepts a valid object', function () {
      // when
      const { error, value } = pageQuerySchema.validate({ number: 2, size: 2 });

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal({ number: 2, size: 2 });
    });

    it('accepts null values for number and size', function () {
      // when
      const { error, value } = pageQuerySchema.validate({ number: null, size: null });

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal({ number: null, size: null });
    });

    it('rejects a negative number', function () {
      // when
      const { error } = pageQuerySchema.validate({ number: -1, size: 2 });

      // then
      expect(error).to.exist;
      expect(error.message).to.equal('"number" must be a positive number');
    });

    it('rejects a size equal to zero', function () {
      // when
      const { error } = pageQuerySchema.validate({ number: 1, size: 0 });

      // then
      expect(error).to.exist;
      expect(error.message).to.equal('"size" must be a positive number');
    });

    it('rejects a size exceeding 200', function () {
      // when
      const { error } = pageQuerySchema.validate({ number: 2, size: 500 });

      // then
      expect(error).to.exist;
      expect(error.message).to.equal('"size" must be less than or equal to 200');
    });
  });

  describe('page validation rules (JSON-encoded form)', function () {
    it('accepts a valid JSON string and parses it into an object', function () {
      // when
      const { error, value } = pageQuerySchema.validate('{"number":2,"size":2}');

      // then
      expect(error).to.not.exist;
      expect(value).to.deep.equal({ number: 2, size: 2 });
    });

    it('rejects a JSON-encoded string whose size exceeds 200, with the underlying Joi message', function () {
      // when
      const { error } = pageQuerySchema.validate('{"number":2,"size":500}');

      // then
      expect(error).to.exist;
      expect(error.message).to.equal('"size" must be less than or equal to 200');
    });

    it('names "page" in the error when the JSON string cannot be parsed', function () {
      // when
      const { error } = pageQuerySchema.validate('not-json');

      // then
      expect(error).to.exist;
      expect(error.message).to.contain('"page" must be a valid JSON string');
    });
  });
});
