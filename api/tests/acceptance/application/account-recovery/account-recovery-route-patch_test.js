import { databaseBuilder, expect, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Route | Account-recovery', function () {
  describe('PATCH /api/account-recovery', function () {
    context('when user has pix authentication method', function () {
      it("should proceed to the account recover by changing user's password and email", async function () {
        // given
        const server = await createServer();
        const userId = databaseBuilder.factory.buildUser.withRawPassword({
          email: 'old-email@example.net',
          rawPassword: 'oldPassword',
        }).id;
        databaseBuilder.factory.buildAccountRecoveryDemand({
          temporaryKey: 'SOME_SUPER_SUPER_SUPER_SUPER_LONG_TEMPORARY_KEY',
          userId,
          oldEmail: 'old-email@example.net',
          newEmail: 'new-email@example.net',
          used: false,
        });
        await databaseBuilder.commit();
        const { authenticationComplement: userPasswordBefore } = await knex('authentication-methods')
          .select('authenticationComplement')
          .where({ userId })
          .first();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/account-recovery',
          payload: {
            data: {
              attributes: {
                'temporary-key': 'SOME_SUPER_SUPER_SUPER_SUPER_LONG_TEMPORARY_KEY',
                password: 'password123#A*',
              },
            },
          },
        });

        // then
        const { authenticationComplement: userPasswordAfter } = await knex('authentication-methods')
          .select('authenticationComplement')
          .where({ userId })
          .first();
        const { email: newUserEmail } = await knex('users').select('email').where({ id: userId }).first();
        expect(response.statusCode).to.equal(204);
        expect(newUserEmail).to.equal('new-email@example.net');
        expect(userPasswordAfter.password).to.not.equal(userPasswordBefore.password);
      });
    });

    context('when user has no pix authentication method', function () {
      it('should proceed to the account recover by create pix authentication method', async function () {
        // given
        const server = await createServer();
        const userWithGarAuthenticationMethod = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod({
          cgu: false,
        });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: '123ABC',
          userId: userWithGarAuthenticationMethod.id,
        });
        databaseBuilder.factory.buildAccountRecoveryDemand({
          temporaryKey: 'SOME_SUPER_SUPER_SUPER_SUPER_LONG_TEMPORARY_KEY',
          userId: userWithGarAuthenticationMethod.id,
          oldEmail: null,
          newEmail: 'new-email@example.net',
          used: false,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/account-recovery',
          payload: {
            data: {
              attributes: {
                'temporary-key': 'SOME_SUPER_SUPER_SUPER_SUPER_LONG_TEMPORARY_KEY',
                password: 'password123#A*',
              },
            },
          },
        });

        // then
        const userAuthenticationMethods = await knex('authentication-methods')
          .select('identityProvider')
          .where({ userId: userWithGarAuthenticationMethod.id });
        const { email: newUserEmail, cgu } = await knex('users')
          .select('email', 'cgu')
          .where({ id: userWithGarAuthenticationMethod.id })
          .first();
        expect(response.statusCode).to.equal(204);
        expect(newUserEmail).to.equal('new-email@example.net');
        expect(cgu).to.equal(true);
        expect(userAuthenticationMethods).to.deepEqualArray([{ identityProvider: 'GAR' }, { identityProvider: 'PIX' }]);
      });
    });
  });
});
