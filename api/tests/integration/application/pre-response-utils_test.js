import { expect, hFake } from '../../test-helper';

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  BaseHttpError,
  MissingQueryParamError,
  NotFoundError,
  PreconditionFailedError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '../../../lib/application/http-errors';

import { EntityValidationError } from '../../../lib/domain/errors';
import { handleDomainAndHttpErrors } from '../../../lib/application/pre-response-utils';

describe('Integration | Application | PreResponse-utils', function () {
  describe('#handleDomainAndHttpErrors', function () {
    const invalidAttributes = [
      {
        attribute: 'type',
        message: 'Error message',
      },
    ];

    const successfulCases = [
      {
        should: 'should return HTTP code 400 when BadRequestError',
        response: new BadRequestError('Error message'),
        expectedStatusCode: 400,
      },
      {
        should: 'should return HTTP code 400 when MissingQueryParamError',
        response: new MissingQueryParamError('Error message'),
        expectedStatusCode: 400,
      },
      {
        should: 'should return HTTP code 401 when UnauthorizedError',
        response: new UnauthorizedError('Error message'),
        expectedStatusCode: 401,
      },
      {
        should: 'should return HTTP code 403 when ForbiddenError',
        response: new ForbiddenError('Error message'),
        expectedStatusCode: 403,
      },
      {
        should: 'should return HTTP code 404 when NotFoundError',
        response: new NotFoundError('Error message'),
        expectedStatusCode: 404,
      },
      {
        should: 'should return HTTP code 409 when ConflictError',
        response: new ConflictError('Error message'),
        expectedStatusCode: 409,
      },
      {
        should: 'should return HTTP code 412 when PreconditionFailedError',
        response: new PreconditionFailedError('Error message'),
        expectedStatusCode: 412,
      },
      {
        should: 'should return HTTP code 422 when EntityValidationError',
        response: new EntityValidationError({ invalidAttributes }),
        expectedStatusCode: 422,
      },
      {
        should: 'should return HTTP code 422 when UnprocessableEntityError',
        response: new UnprocessableEntityError('Error message'),
        expectedStatusCode: 422,
      },
      {
        should: 'should return HTTP code 400 when BaseHttpError',
        response: new BaseHttpError('Error message'),
        expectedStatusCode: 400,
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    successfulCases.forEach((testCase) => {
      it(testCase.should, async function () {
        // given
        const request = {
          response: testCase.response,
        };

        // when
        const response = await handleDomainAndHttpErrors(request, hFake);

        // then
        expect(response.statusCode).to.equal(testCase.expectedStatusCode);
      });
    });
  });
});
