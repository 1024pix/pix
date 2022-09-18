const { databaseBuilder, expect, sinon, knex } = require('../../../test-helper');
const createServer = require('../../../../server');
const mailer = require('../../../../lib/infrastructure/mailers/mailer');

describe('Acceptance | Route | account-recovery', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/account-recovery', function () {
    afterEach(function () {
      return databaseBuilder.knex('account-recovery-demands').delete();
    });

    it('should have make an account recovery demand', async function () {
      // given
      const studentINE = '012345678BS';
      const userId = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'old-mail@example.net',
      }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        userId,
        nationalStudentId: studentINE,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
      }).id;
      await databaseBuilder.commit();
      const mailerSpy = sinon.spy(mailer, 'sendEmail');
      const options = {
        method: 'POST',
        url: '/api/account-recovery',
        payload: {
          data: {
            attributes: {
              'first-name': 'Buffy',
              'last-name': 'Summers',
              'ine-ina': '012345678BS',
              birthdate: '1981-01-19',
              email: 'new-mail@example.net',
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      const recoveryDemand = await knex('account-recovery-demands')
        .select(['userId', 'oldEmail', 'newEmail', 'used', 'organizationLearnerId'])
        .first();
      expect(response.statusCode).to.equal(204);
      expect(mailerSpy).to.have.been.calledOnce;
      expect(recoveryDemand).to.deep.equal({
        userId,
        oldEmail: 'old-mail@example.net',
        newEmail: 'new-mail@example.net',
        used: false,
        organizationLearnerId,
      });
    });
  });

  describe('GET /api/account-recovery/{temporaryKey}', function () {
    it('should return the account recovery demand', async function () {
      // given
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ firstName: 'Buffy' }).id;
      const accountRecoveryDemandId = databaseBuilder.factory.buildAccountRecoveryDemand({
        temporaryKey: 'SOME_SUPER_SUPER_SUPER_SUPER_LONG_TEMPORARY_KEY',
        newEmail: 'new-email@example.net',
        organizationLearnerId,
        used: false,
      }).id;
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: '/api/account-recovery/SOME_SUPER_SUPER_SUPER_SUPER_LONG_TEMPORARY_KEY',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        type: 'account-recovery-demands',
        id: accountRecoveryDemandId.toString(),
        attributes: {
          'first-name': 'Buffy',
          email: 'new-email@example.net',
        },
      });
    });
  });

  describe('PATCH /api/account-recovery', function () {
    it("should proceed to the account recover by changing user's password and email", async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRawPassword({ email: 'old-email@example.net' }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId }).id;
      databaseBuilder.factory.buildAccountRecoveryDemand({
        temporaryKey: 'SOME_SUPER_SUPER_SUPER_SUPER_LONG_TEMPORARY_KEY',
        userId,
        organizationLearnerId,
        oldEmail: 'old-email@example.net',
        newEmail: 'new-email@example.net',
        used: false,
      });
      await databaseBuilder.commit();
      const { authenticationComplement: userPasswordBefore } = await knex('authentication-methods')
        .select('authenticationComplement')
        .where({ userId })
        .first();
      const options = {
        method: 'PATCH',
        url: '/api/account-recovery',
        payload: {
          data: {
            attributes: {
              'temporary-key': 'SOME_SUPER_SUPER_SUPER_SUPER_LONG_TEMPORARY_KEY',
              password: 'Azerty123',
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

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
});
