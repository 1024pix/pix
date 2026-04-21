import { handleDomainAndHttpErrors } from '../../../../src/shared/application/pre-response-utils.js';
import { EntityValidationError } from '../../../../src/shared/domain/errors.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';

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
        should: 'should return HTTP code 422 when EntityValidationError',
        response: new EntityValidationError({ invalidAttributes }),
        expectedStatusCode: 422,
      },
    ];

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
