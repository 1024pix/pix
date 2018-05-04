const { expect } = require('../../../../test-helper');
const JSONAPIError = require('jsonapi-serializer').Error;
const errors = require('../../../../../lib/infrastructure/errors');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/error-serializer');

describe('Unit | Serializer | JSONAPI | error-serializer', () => {

  describe('#serialize()', () => {

    it('should convert a infrastructure error object into JSONAPIError', () => {
      // given
      const error = new errors.MissingQueryParamError('assessmentId');
      const expectedJSONAPIError = JSONAPIError({
        code: '400',
        title: 'Missing Query Parameter',
        detail: 'Missing assessmentId query parameter.'
      });

      // when
      const serializedError = serializer.serialize(error);

      // then
      expect(serializedError).to.deep.equal(expectedJSONAPIError);
    });
  });
});
