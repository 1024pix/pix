import { createServer, databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Acceptance | Identity Access Management | Application | Route | account-recovery', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/account-recovery', function () {
    context('when user has pix authentication method', function () {
      it("proceeds to the account recover by changing user's password and email", async function () {
        // given
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
      it('proceeds to the account recover by create pix authentication method', async function () {
        // given
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

  describe('GET /api/account-recovery/{temporaryKey}', function () {
    context('when account recovery demand found', function () {
      it('returns 200 http status code', async function () {
        // given
        const temporaryKey = 'FfgpFXgyuO062nPUPwcb8Wy3KcgkqR2p2GyEuGVaNI4=';
        const userId = 1234;
        const newEmail = 'newEmail@example.net';
        const firstName = 'Gertrude';
        databaseBuilder.factory.buildUser.withRawPassword({ id: userId });
        const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({ userId, firstName });
        const { id } = databaseBuilder.factory.buildAccountRecoveryDemand({
          userId,
          organizationLearnerId,
          temporaryKey,
          newEmail,
          used: false,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: '/api/account-recovery/' + temporaryKey,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes.email).to.equal(newEmail.toLowerCase());
        expect(response.result.data.attributes['first-name']).to.equal(firstName);
        expect(response.result.data.id).to.equal(id.toString());
      });
    });
  });

  describe('POST /api/account-recovery', function () {
    const studentInformation = {
      ineIna: '123456789aa',
      firstName: 'Jude',
      lastName: 'Law',
      birthdate: '2016-06-01',
    };

    const createUserWithSeveralOrganizationLearners = async ({ email = 'jude.law@example.net' } = {}) => {
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        id: 8,
        firstName: 'Judy',
        lastName: 'Howl',
        email,
        username: 'jude.law0601',
      });
      const organization = databaseBuilder.factory.buildOrganization({
        id: 7,
        name: 'Collège Hollywoodien',
      });
      const latestOrganization = databaseBuilder.factory.buildOrganization({
        id: 2,
        name: 'Super Collège Hollywoodien',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
        ...studentInformation,
        nationalStudentId: studentInformation.ineIna.toUpperCase(),
        organizationId: organization.id,
        updatedAt: new Date('2005-01-01T15:00:00Z'),
      });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
        ...studentInformation,
        nationalStudentId: studentInformation.ineIna.toUpperCase(),
        organizationId: latestOrganization.id,
        updatedAt: new Date('2010-01-01T15:00:00Z'),
      });
      await databaseBuilder.commit();
    };

    it('returns 204 HTTP status code', async function () {
      // given
      await createUserWithSeveralOrganizationLearners();
      const newEmail = 'new_email@example.net';

      const options = {
        method: 'POST',
        url: '/api/account-recovery',
        payload: {
          data: {
            attributes: {
              'ine-ina': studentInformation.ineIna,
              'first-name': studentInformation.firstName,
              'last-name': studentInformation.lastName,
              birthdate: studentInformation.birthdate,
              email: newEmail,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('returns 400 if email already exists', async function () {
      // given
      const newEmail = 'new_email@example.net';
      await createUserWithSeveralOrganizationLearners({ email: newEmail });

      const options = {
        method: 'POST',
        url: '/api/account-recovery',
        payload: {
          data: {
            attributes: {
              'ine-ina': studentInformation.ineIna,
              'first-name': studentInformation.firstName,
              'last-name': studentInformation.lastName,
              birthdate: studentInformation.birthdate,
              email: newEmail,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      expect(response.result.errors[0].detail).to.equal('Cette adresse e-mail est déjà utilisée.');
    });
  });
});
