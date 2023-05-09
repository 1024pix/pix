import { expect } from '../../../../test-helper.js';
const JSONAPIError = require('jsonapi-serializer').Error;
import { MissingQueryParamError, ConflictError } from '../../../../../lib/application/http-errors.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/error-serializer.js';

describe('Unit | Serializer | JSONAPI | error-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a infrastructure error object into JSONAPIError', function () {
      // given
      const error = new MissingQueryParamError('assessmentId');
      const expectedJSONAPIError = JSONAPIError({
        status: '400',
        title: 'Missing Query Parameter',
        detail: 'Missing assessmentId query parameter.',
      });

      // when
      const serializedError = serializer.serialize(error);

      // then
      expect(serializedError).to.deep.equal(expectedJSONAPIError);
    });

    it('should convert a conflict error object into JSONAPIError', function () {
      // given
      const error = new ConflictError('error detail', 'code', { shortCode: 'shortCode', value: 'value' });
      const expectedJSONAPIError = JSONAPIError({
        status: '409',
        title: 'Conflict',
        detail: 'error detail',
        code: 'code',
        meta: { shortCode: 'shortCode', value: 'value' },
      });

      // when
      const serializedError = serializer.serialize(error);

      // then
      expect(serializedError).to.deep.equal(expectedJSONAPIError);
    });
  });
});
