const { expect, hFake } = require('../../test-helper');

const {
  BadRequestError, ConflictError, ForbiddenError,
  BaseHttpError, MissingQueryParamError, NotFoundError,
  PreconditionFailedError, UnauthorizedError, UnprocessableEntityError
} = require('../../../lib/application/http-errors');

const { EntityValidationError } = require('../../../lib/domain/errors');

const { handleDomainAndHttpErrors } = require('../../../lib/application/pre-response-utils');

describe('Integration | Application | PreResponse-utils', () => {

  describe('#handleDomainAndHttpErrors', () => {

    const invalidAttributes = [{
      attribute: 'type',
      message: 'Error message'
    }];

    const successfulCases = [
      { should: 'should return HTTP code 400 when BadRequestError', response: new BadRequestError('Error message'), expectedStatusCode: 400 },
      { should: 'should return HTTP code 400 when MissingQueryParamError', response: new MissingQueryParamError('Error message'), expectedStatusCode: 400 },
      { should: 'should return HTTP code 401 when UnauthorizedError', response: new UnauthorizedError('Error message'), expectedStatusCode: 401 },
      { should: 'should return HTTP code 403 when ForbiddenError', response: new ForbiddenError('Error message'), expectedStatusCode: 403 },
      { should: 'should return HTTP code 404 when NotFoundError', response: new NotFoundError('Error message'), expectedStatusCode: 404 },
      { should: 'should return HTTP code 409 when ConflictError', response: new ConflictError('Error message'), expectedStatusCode: 409 },
      { should: 'should return HTTP code 421 when PreconditionFailedError', response: new PreconditionFailedError('Error message'), expectedStatusCode: 421 },
      { should: 'should return HTTP code 422 when EntityValidationError', response: new EntityValidationError({ invalidAttributes }), expectedStatusCode: 422 },
      { should: 'should return HTTP code 422 when UnprocessableEntityError', response: new UnprocessableEntityError('Error message'), expectedStatusCode: 422 },
      { should: 'should return HTTP code 500 when BaseHttpError', response: new BaseHttpError('Error message'), expectedStatusCode: 500 },
    ];

    successfulCases.forEach((testCase) => {
      it(testCase.should, async () => {
        // given
        const request = {
          response: testCase.response
        };

        // when
        const response = await handleDomainAndHttpErrors(request, hFake);

        // then
        expect(response.statusCode).to.equal(testCase.expectedStatusCode);
      });
    });
  });

});
