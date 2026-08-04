import sinon from 'sinon';

import { createServer } from '../../../../../server.js';
import { mailService } from '../../../../../src/shared/domain/services/mail-service.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Acceptance | Identity Access Management | Application | Route | organization-learner-account-recovery', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
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
      const sendAccountRecoveryEmailSpy = sinon.spy(mailService, 'sendAccountRecoveryEmail');

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
      expect(sendAccountRecoveryEmailSpy).to.have.been.calledWithExactly({
        firstName: 'Jude',
        email: 'new_email@example.net',
        temporaryKey: sinon.match.string,
      });
    });

    it('returns 422 if email already exists', async function () {
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
      expect(response.statusCode).to.equal(422);
      expect(response.result.errors[0].detail).to.equal('Invalid or already used e-mail address');
    });
  });
});
