import { expect } from '../../../test-helper';
import { serializeHttpErrorResponse } from '../../../../lib/infrastructure/http/errors-helper';

describe('serializeHttpErrorResponse', function () {
  describe('when http error data is null', function () {
    it('should display the string message', function () {
      // given
      const errorResponse = {
        code: '500',
        data: null,
      };

      const customMessage = 'Something bad happened';

      // when
      const formattedResponse = serializeHttpErrorResponse(errorResponse, customMessage);

      // then
      expect(formattedResponse).to.deep.equal({
        customMessage,
        errorDetails: 'null',
      });
    });
  });

  describe('when http error data is a string', function () {
    it('should display the string message', function () {
      // given
      const errorResponse = {
        code: null,
        data: 'Error',
      };

      const customMessage = 'Something bad happened';

      // when
      const formattedResponse = serializeHttpErrorResponse(errorResponse, customMessage);

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
      const formattedResponse = serializeHttpErrorResponse(errorResponse, customMessage);

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
      const formattedResponse = serializeHttpErrorResponse(errorResponse, customMessage);

      // then
      expect(formattedResponse).to.deep.equal({
        customMessage,
        errorDetails: JSON.stringify(errorResponse.data),
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
      const formattedResponse = serializeHttpErrorResponse(errorResponse, customMessage);

      // then
      expect(formattedResponse).to.deep.equal({
        customMessage,
        errorDetails: JSON.stringify(errorResponse.data),
      });
    });
  });

  describe('When no custom message is provided', function () {
    it('should display only formatted error', function () {
      // given
      const errorResponse = {
        code: 400,
        data: {
          error: 'invalid_client',
          custom_error: 'Invalid authentication method for accessing this endpoint.',
        },
      };

      // when
      const formattedResponse = serializeHttpErrorResponse(errorResponse);

      // then
      expect(formattedResponse).to.deep.equal(JSON.stringify(errorResponse.data));
    });
  });
});
