const { expect } = require('../../test-helper');
const { HttpError, MissingQueryParamError } = require('../../../lib/application/http-errors');

describe('Unit | Application | HTTP Errors', () => {

  describe('#HttpError', () => {
    it('should export an HttpError', () => {
      expect(HttpError).to.exist;
    });

    it('should have a title, message, and errorCode property', () => {
      // given
      const expectedTitle = 'Internal Server Error';
      const expectedMessage = 'Boom...';
      const expectedErrorCode = 500;

      // when
      const httpError = new HttpError('Boom...');

      // then
      expect(httpError.title).to.equal(expectedTitle);
      expect(httpError.message).to.equal(expectedMessage);
      expect(httpError.status).to.equal(expectedErrorCode);
    });
  });

  describe('#MissingQueryParamError', () => {
    it('should export an MissingQueryParamError', () => {
      expect(MissingQueryParamError).to.exist;
    });

    it('should export an decendant instance of Infrastructure Error', () => {
      // when
      const missingQueryParamError = new MissingQueryParamError('assessmentId');

      // then
      expect(missingQueryParamError).to.be.an.instanceof(HttpError);
    });

    it('should have a title, message, and errorCode property', () => {
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
