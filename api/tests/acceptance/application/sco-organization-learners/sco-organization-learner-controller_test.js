import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
} from '../../../test-helper.js';

describe('Acceptance | Controller | sco-organization-learners', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PUT /api/sco-organization-learners/possibilities', function () {
    it('returns the organizationLearner linked to the user and a 200 status code response', async function () {
      //given
      const organization = databaseBuilder.factory.buildOrganization({
        isManagingStudents: true,
        type: 'SCO',
      });
      const user = databaseBuilder.factory.buildUser();
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userId: null,
        nationalStudentId: 'nsi123ABC',
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PUT',
        url: '/api/sco-organization-learners/possibilities',
        headers: {},
        payload: {
          data: {
            attributes: {
              'organization-id': organization.id,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          },
        },
      });

      // then
      const expectedUsername = 'billy.thekid0508';

      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          attributes: {
            birthdate: '2005-08-05',
            'first-name': 'Billy',
            'last-name': 'TheKid',
            username: expectedUsername,
          },
          id: expectedUsername,
          type: 'sco-organization-learners',
        },
      });
    });
  });

  describe('POST /api/sco-organization-learners/password-update', function () {
    it('should return a 200 status after having successfully updated the password', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId,
      }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/sco-organization-learners/password-update',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              'organization-learner-id': organizationLearnerId,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sco-organization-learners/account-recovery', function () {
    it('should return a 200 status and student information for account recovery', async function () {
      // given
      const studentInformation = {
        ineIna: '123456789AA',
        firstName: 'Jude',
        lastName: 'Law',
        birthdate: '2016-06-01',
      };
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        id: 8,
        firstName: 'Judy',
        lastName: 'Howl',
        email: 'jude.law@example.net',
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
        nationalStudentId: studentInformation.ineIna,
        organizationId: organization.id,
        updatedAt: new Date('2005-01-01T15:00:00Z'),
      });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
        ...studentInformation,
        nationalStudentId: studentInformation.ineIna,
        organizationId: latestOrganization.id,
        updatedAt: new Date('2010-01-01T15:00:00Z'),
      });

      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: '/api/sco-organization-learners/account-recovery',
        payload: {
          data: {
            type: 'student-information',
            attributes: {
              'ine-ina': studentInformation.ineIna,
              'first-name': studentInformation.firstName,
              'last-name': studentInformation.lastName,
              birthdate: studentInformation.birthdate,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      expect(response.result.data).to.deep.equal({
        type: 'student-information-for-account-recoveries',
        attributes: {
          'first-name': 'Jude',
          'last-name': 'Law',
          username: 'jude.law0601',
          email: 'jude.law@example.net',
          'latest-organization-name': 'Super Collège Hollywoodien',
        },
      });
    });
  });

  describe('POST /api/sco-organization-learners/batch-username-password-generate', function () {
    context('when successfully update organization learners passwords', function () {
      it('returns an HTTP status code 200 with generated CSV file', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;

        const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
        databaseBuilder.factory.buildMembership({ organizationId, userId });

        const paul = databaseBuilder.factory.buildUser.withRawPassword({ firstName: 'Paul', username: 'paul' });
        const jacques = databaseBuilder.factory.buildUser.withRawPassword({
          firstName: 'Jacques',
          username: 'jacques',
        });

        const organizationLearnersId = [
          databaseBuilder.factory.buildOrganizationLearner({
            organizationId,
            userId: paul.id,
            division: '3A',
          }).id,
          databaseBuilder.factory.buildOrganizationLearner({
            organizationId,
            userId: jacques.id,
            division: '3A',
          }).id,
        ];

        await databaseBuilder.commit();

        // when
        const { headers, payload, statusCode } = await server.inject({
          method: 'POST',
          url: '/api/sco-organization-learners/batch-username-password-generate',
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
          payload: {
            data: {
              attributes: {
                'organization-id': organizationId,
                'organization-learners-id': organizationLearnersId,
              },
            },
          },
        });

        // then
        expect(statusCode).to.equal(200);
        expect(headers['content-type']).to.equal('text/csv;charset=utf-8');
        expect(headers['content-disposition']).to.contains('_organization_learners_password_reset.csv');

        // eslint-disable-next-line no-unused-vars
        const [fileHeaders, firstRow, ...unusedRows] = payload.split('\n').map((row) => row.trim());
        expect(fileHeaders).to.equal('"Classe";"Nom";"Prénom";"Identifiant";"Mot de passe"');
        expect(firstRow).to.match(/^"3A";/);
      });
    });
  });
});
