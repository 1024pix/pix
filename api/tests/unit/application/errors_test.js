import { expect } from '../../test-helper';
import { BaseHttpError, MissingQueryParamError } from '../../../lib/application/http-errors';

describe('Unit | Application | HTTP Errors', function () {
  describe('#BaseHttpError', function () {
    it('should have a title, message, and errorCode property', function () {
      // given
      const expectedTitle = 'Default Bad Request';
      const expectedMessage = 'Boom...';
      const expectedErrorCode = 400;

      // when
      const httpError = new BaseHttpError('Boom...');

      // then
      expect(httpError.title).to.equal(expectedTitle);
      expect(httpError.message).to.equal(expectedMessage);
      expect(httpError.status).to.equal(expectedErrorCode);
    });
  });

  describe('#MissingQueryParamError', function () {
    it('should export an decendant instance of Infrastructure Error', function () {
      // when
      const missingQueryParamError = new MissingQueryParamError('assessmentId');

      // then
      expect(missingQueryParamError).to.be.an.instanceof(BaseHttpError);
    });

    it('should have a title, message, and errorCode property', function () {
      // given
      const expectedTitle = 'Missing Query Parameter';
      const expectedMessage = 'Missing assessmentId query parameter.';
      const expectedErrorCode = 400;

      // when
      const missingQueryParamError = new MissingQueryParamError('assessmentId');

      // then
      expect(missingQueryParamError.title).to.equal(expectedTitle);
      expect(missingQueryParamError.message).to.equal(expectedMessage);
      expect(missingQueryParamError.status).to.equal(expectedErrorCode);
    });
  });
});
