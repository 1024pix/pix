const { expect } = require('../../../test-helper');

const { getErrorDetails } = require('../../../../lib/infrastructure/http/errors-helper');

describe('getErrorDetails', function () {
  describe('when http error data is a string', function () {
    it('should display the string message', function () {
      // given
      const errorResponse = {
        code: null,
        data: 'Error',
      };

      const customMessage = 'Something bad happened';

      // when
      const formattedResponse = getErrorDetails(errorResponse, customMessage);

      // then
      expect(formattedResponse).to.deep.equal({
        customMessage,
        errorDetails: errorResponse.data,
      });
    });
  });

  describe('when http error data is an empty string', function () {
    it('should display a generic message in the formatted response', function () {
      // given
      const errorResponse = { code: 401, data: '', isSuccessful: false };
      const customMessage = 'Something bad happened';

      // when
      const formattedResponse = getErrorDetails(errorResponse, customMessage);

      // then
      expect(formattedResponse).to.deep.equal({
        customMessage,
        errorDetails: 'Pas de détails disponibles',
      });
    });
  });

  describe('when http error data contains error and error description', function () {
    it('should display it in the formatted response', function () {
      // given
      const errorResponse = {
        code: 400,
        data: {
          error: 'invalid_client',
          error_description: 'Invalid authentication method for accessing this endpoint.',
        },
      };

      const customMessage = 'Something bad happened';

      // when
      const formattedResponse = getErrorDetails(errorResponse, customMessage);

      // then
      expect(formattedResponse).to.deep.equal({
        customMessage,
        errorDetails: {
          errorDescription: 'Invalid authentication method for accessing this endpoint.',
          errorType: 'invalid_client',
        },
      });
    });
  });

  describe("when http error data doesn't contain error description", function () {
    it('should display it in the formatted response', function () {
      // given
      const errorResponse = {
        code: 400,
        data: {
          error: 'invalid_client',
          custom_error: 'Invalid authentication method for accessing this endpoint.',
        },
      };

      const customMessage = 'Something bad happened';

      // when
      const formattedResponse = getErrorDetails(errorResponse, customMessage);

      // then
      expect(formattedResponse).to.deep.equal({
        customMessage,
        errorDetails: JSON.stringify(errorResponse.data),
      });
    });
  });
});
