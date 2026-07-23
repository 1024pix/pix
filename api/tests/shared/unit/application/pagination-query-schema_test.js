import { pageQuerySchema } from '../../../../src/shared/application/pagination-query-schema.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Application | pagination-query-schema', function () {
  it('defaults to an empty object when no value is provided', function () {
    // when
    const { error, value } = pageQuerySchema.validate(undefined);

    // then
    expect(error).to.not.exist;
    expect(value).to.deep.equal({});
  });

  it('accepts an already parsed object (bracket notation)', function () {
    // when
    const { error, value } = pageQuerySchema.validate({ number: 2, size: 2 });

    // then
    expect(error).to.not.exist;
    expect(value).to.deep.equal({ number: 2, size: 2 });
  });

  it('accepts a JSON-encoded string and parses it into an object', function () {
    // when
    const { error, value } = pageQuerySchema.validate('{"number":2,"size":2}');

    // then
    expect(error).to.not.exist;
    expect(value).to.deep.equal({ number: 2, size: 2 });
  });

  it('rejects a string that is not valid JSON', function () {
    // when
    const { error } = pageQuerySchema.validate('not-json');

    // then
    expect(error).to.exist;
  });

  it('rejects a JSON-encoded string whose parsed object breaks the page schema', function () {
    // when
    const { error } = pageQuerySchema.validate('{"number":2,"size":500}');

    // then
    expect(error).to.exist;
  });

  it('rejects an object that breaks the page schema', function () {
    // when
    const { error } = pageQuerySchema.validate({ number: 2, size: 500 });

    // then
    expect(error).to.exist;
  });

  it('rejects a negative number', function () {
    // when
    const { error } = pageQuerySchema.validate({ number: -1, size: 2 });

    // then
    expect(error).to.exist;
  });

  it('rejects a size equal to zero', function () {
    // when
    const { error } = pageQuerySchema.validate({ number: 1, size: 0 });

    // then
    expect(error).to.exist;
  });

  it('rejects a JSON-encoded string with a negative size', function () {
    // when
    const { error } = pageQuerySchema.validate('{"number":1,"size":-2}');

    // then
    expect(error).to.exist;
  });

  it('accepts null values for number and size', function () {
    // when
    const { error, value } = pageQuerySchema.validate({ number: null, size: null });

    // then
    expect(error).to.not.exist;
    expect(value).to.deep.equal({ number: null, size: null });
  });
});
