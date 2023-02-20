import { expect, databaseBuilder, knex } from '../../../../test-helper';
import createServer from '../../../../../server';
import jsonwebtoken from 'jsonwebtoken';
import authenticationSessionService from '../../../../../lib/domain/services/authentication/authentication-session-service';

describe('Acceptance | Application | Oidc | Routes', function () {
  describe('POST /api/oidc/user/check-reconciliation', function () {
    context('when user has no oidc authentication method', function () {
      afterEach(async function () {
        await knex('user-logins').delete();
      });

      it('should return 200 HTTP status', async function () {
        // given
        const server = await createServer();
        databaseBuilder.factory.buildUser.withRawPassword({ email: 'eva.poree@example.net', rawPassword: 'pix123' });
        await databaseBuilder.commit();

        const idToken = jsonwebtoken.sign(
          {
            given_name: 'Brice',
            family_name: 'Glace',
            nonce: 'nonce',
            sub: 'some-user-unique-id',
          },
          'secret'
        );
        const userAuthenticationKey = await authenticationSessionService.save({
          sessionContent: { idToken },
          userInfo: {
            firstName: 'Brice',
            lastName: 'Glace',
            nonce: 'nonce',
            externalIdentityId: 'some-user-unique-id',
          },
        });

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/api/oidc/user/check-reconciliation`,
          payload: {
            data: {
              attributes: {
                email: 'eva.poree@example.net',
                password: 'pix123',
                'identity-provider': 'CNAV',
                'authentication-key': userAuthenticationKey,
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['full-name-from-pix']).to.exist;
        expect(response.result.data.attributes['full-name-from-external-identity-provider']).to.exist;
        expect(response.result.data.attributes['email']).to.exist;
        expect(response.result.data.attributes['authentication-methods']).to.exist;
      });
    });
  });
});
