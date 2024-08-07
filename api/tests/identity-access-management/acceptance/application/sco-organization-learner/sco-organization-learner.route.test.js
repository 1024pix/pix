import { Membership } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | Identity Access Management | Application | Route | Sco Organization Learners', function () {
  describe('POST /api/sco-organization-learners/generate-usernames', function () {
    const organizationLearnerIds = [11, 12];
    const hashedPassword = 'testHashedPassword';
    let server, organizationId, adminUser, user1;

    beforeEach(async function () {
      server = await createServer();
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      adminUser = databaseBuilder.factory.buildUser.withRawPassword();
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: adminUser.id,
        organizationRole: Membership.roles.ADMIN,
      });
      user1 = databaseBuilder.factory.buildUser({ username: null });
      databaseBuilder.factory.buildOrganizationLearner({
        id: organizationLearnerIds[0],
        organizationId,
        userId: user1.id,
      });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: user1.id,
      });

      await databaseBuilder.commit();
    });

    it('returns a list of organization learners id, temporary password and username with an HTTP status code 200', async function () {
      // given
      const user2 = databaseBuilder.factory.buildUser({ username: null });
      databaseBuilder.factory.buildOrganizationLearner({
        id: organizationLearnerIds[1],
        organizationId,
        userId: user2.id,
      });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId: user2.id,
        hashedPassword,
      });

      await databaseBuilder.commit();

      // when
      const { headers, payload, statusCode } = await server.inject({
        method: 'POST',
        url: '/api/sco-organization-learners/generate-usernames',
        headers: { authorization: generateValidRequestAuthorizationHeader(adminUser.id) },
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              'organization-learner-ids': organizationLearnerIds,
            },
          },
        },
      });

      // then
      expect(statusCode).to.equal(200);
      expect(headers['content-type']).to.equal('text/csv;charset=utf-8');
      expect(headers['content-disposition']).to.contains('_organization_learner_usernames.csv');

      const [fileHeaders, firstRow, ...unusedRows] = payload.split('\n').map((row) => row.trim());
      expect(fileHeaders).to.equal('"Classe";"Nom";"Prénom";"Identifiant";"Mot de passe"');
      expect(firstRow).to.match(/^"3eme";"last-name";"first-name";"firstname.lastname0508";/);
    });
  });
});
