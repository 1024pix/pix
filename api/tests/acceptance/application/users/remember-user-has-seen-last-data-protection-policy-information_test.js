import { expect, generateValidRequestAuthorizationHeader, databaseBuilder, sinon } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Route | remember-user-has-seen-last-data-protection-policy-information', function () {
  describe('Success case', function () {
    let clock;
    let server;
    const now = new Date('2022-12-07');

    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now,
        toFake: ['Date'],
      });

      server = await createServer();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return a response with HTTP status code 200', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({ lastDataProtectionPolicySeenAt: null });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/users/${user.id}/has-seen-last-data-protection-policy-information`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes['last-data-protection-policy-seen-at']).to.deep.equal(now);
    });
  });
});
