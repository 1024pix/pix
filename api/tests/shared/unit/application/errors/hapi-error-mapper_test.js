import { expect } from 'chai';

import { ErrorMappingRegistry } from '../../../../../src/shared/application/errors/error-mapping-registry.js';
import { HapiErrorMapper } from '../../../../../src/shared/application/errors/hapi-error-mapper.js';
import {
  BadRequestError,
  BaseHttpError,
  ConflictError,
  ForbiddenError,
  MissingQueryParamError,
  NotFoundError,
  PreconditionFailedError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '../../../../../src/shared/application/errors/http-errors.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Shared | Unit | Application | HapiErrorMapper', function () {
  let errorManager;

  beforeEach(function () {
    const registry = new ErrorMappingRegistry();
    errorManager = new HapiErrorMapper(registry);
  });

  describe('When no error in request', function () {
    it('process the request', async function () {
      // given
      const request = { response: { statusCode: 200 } };

      // when
      const response = errorManager.handle(request, hFake);

      // then
      expect(response).to.be.equal(hFake.continue);
    });
  });

  describe('When BaseHttpError is handled', function () {
    const successfulCases = [
      {
        should: 'returns HTTP code 400 when BadRequestError',
        response: new BadRequestError('Error message'),
        expectedStatusCode: 400,
      },
      {
        should: 'returns HTTP code 400 when MissingQueryParamError',
        response: new MissingQueryParamError('Error message'),
        expectedStatusCode: 400,
      },
      {
        should: 'returns HTTP code 401 when UnauthorizedError',
        response: new UnauthorizedError('Error message'),
        expectedStatusCode: 401,
      },
      {
        should: 'returns HTTP code 403 when ForbiddenError',
        response: new ForbiddenError('Error message'),
        expectedStatusCode: 403,
      },
      {
        should: 'returns HTTP code 404 when NotFoundError',
        response: new NotFoundError('Error message'),
        expectedStatusCode: 404,
      },
      {
        should: 'returns HTTP code 409 when ConflictError',
        response: new ConflictError('Error message'),
        expectedStatusCode: 409,
      },
      {
        should: 'returns HTTP code 412 when PreconditionFailedError',
        response: new PreconditionFailedError('Error message'),
        expectedStatusCode: 412,
      },
      {
        should: 'returns HTTP code 422 when UnprocessableEntityError',
        response: new UnprocessableEntityError('Error message'),
        expectedStatusCode: 422,
      },
      {
        should: 'returns HTTP code 400 when BaseHttpError',
        response: new BaseHttpError('Error message'),
        expectedStatusCode: 400,
      },
    ];

    successfulCases.forEach((testCase) => {
      it(testCase.should, async function () {
        // given
        const request = {
          response: testCase.response,
        };

        // when
        const response = errorManager.handle(request, hFake);

        // then
        expect(response.statusCode).to.equal(testCase.expectedStatusCode);
      });
    });
  });

  describe('When EntityValidationError is handled', function () {
    it('translates EntityValidationError', async function () {
      // given
      const request = {
        state: { locale: 'en' },
        response: new EntityValidationError({
          invalidAttributes: [{ attribute: 'name', message: 'STAGE_TITLE_IS_REQUIRED' }],
        }),
      };

      // when
      const response = errorManager.handle(request, hFake);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal({
        errors: [
          {
            detail: 'The title is required',
            source: {
              pointer: '/data/attributes/name',
            },
            status: '422',
            title: 'Invalid data attribute "name"',
          },
        ],
      });
    });

    it('translates EntityValidationError to french', async function () {
      // given
      const request = {
        state: { locale: 'fr-fr' },
        response: new EntityValidationError({
          invalidAttributes: [{ attribute: 'name', message: 'STAGE_TITLE_IS_REQUIRED' }],
        }),
      };

      // when
      const response = errorManager.handle(request, hFake);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal({
        errors: [
          {
            detail: 'Le titre du palier est obligatoire',
            source: {
              pointer: '/data/attributes/name',
            },
            status: '422',
            title: 'Invalid data attribute "name"',
          },
        ],
      });
    });

    it('fallbacks to the message if the translation is not found', async function () {
      // given
      const request = {
        state: { locale: 'en' },
        response: new EntityValidationError({
          invalidAttributes: [{ attribute: 'name', message: 'message' }],
        }),
      };

      // when
      const response = errorManager.handle(request, hFake);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal({
        errors: [
          {
            detail: 'message',
            source: {
              pointer: '/data/attributes/name',
            },
            status: '422',
            title: 'Invalid data attribute "name"',
          },
        ],
      });
    });

    it('fallbacks to the message if the translation is not found with special chars', async function () {
      // given
      const request = {
        state: { locale: 'en' },
        response: new EntityValidationError({
          invalidAttributes: [{ attribute: 'name', message: 'special-:{%}/_chars' }],
        }),
      };

      // when
      const response = errorManager.handle(request, hFake);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal({
        errors: [
          {
            detail: 'special-:{%}/_chars',
            source: {
              pointer: '/data/attributes/name',
            },
            status: '422',
            title: 'Invalid data attribute "name"',
          },
        ],
      });
    });

    it('translates EntityValidationError even if invalidAttributes is undefined', async function () {
      // given
      const request = {
        state: { locale: 'en' },
        response: new EntityValidationError({
          invalidAttributes: undefined,
        }),
      };

      // when
      const response = errorManager.handle(request, hFake);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal({ errors: [{ status: '422' }] });
    });
  });
});
