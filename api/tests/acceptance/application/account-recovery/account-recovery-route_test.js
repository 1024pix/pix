import { databaseBuilder, expect } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Route | Account-recovery', function () {
  describe('POST /api/account-recovery', function () {
    let server;

    beforeEach(async function () {
      //given
      server = await createServer();
    });

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

    it('should return 204 HTTP status code', async function () {
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

    it('should return 400 if email already exists', async function () {
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
