const { expect } = require('../../test-helper');
const errors = require('../../../lib/application/errors');

describe('Unit | Infrastructure | Errors', () => {

  describe('#InfrastructureError', () => {
    it('should export an InfrastructureError', () => {
      expect(errors.InfrastructureError).to.exist;
    });

    it('should have a title, message, and errorCode property', () => {
      // given
      const expectedTitle = 'Internal Server Error';
      const expectedMessage = 'Boom...';
      const expectedErrorCode = 500;

      // when
      const infrastructureError = new errors.InfrastructureError('Boom...');

      // then
      expect(infrastructureError.title).to.equal(expectedTitle);
      expect(infrastructureError.message).to.equal(expectedMessage);
      expect(infrastructureError.status).to.equal(expectedErrorCode);
    });
  });

  describe('#MissingQueryParamError', () => {
    it('should export an MissingQueryParamError', () => {
      expect(errors.MissingQueryParamError).to.exist;
    });

    it('should export an decendant instance of Infrastructure Error', () => {
      // when
      const missingQueryParamError = new errors.MissingQueryParamError('assessmentId');

      // then
      expect(missingQueryParamError).to.be.an.instanceof(errors.InfrastructureError);
    });

    it('should have a title, message, and errorCode property', () => {
      // given
      const expectedTitle = 'Missing Query Parameter';
      const expectedMessage = 'Missing assessmentId query parameter.';
      const expectedErrorCode = 400;

      // when
      const missingQueryParamError = new errors.MissingQueryParamError('assessmentId');

      // then
      expect(missingQueryParamError.title).to.equal(expectedTitle);
      expect(missingQueryParamError.message).to.equal(expectedMessage);
      expect(missingQueryParamError.status).to.equal(expectedErrorCode);
    });
  });
});
