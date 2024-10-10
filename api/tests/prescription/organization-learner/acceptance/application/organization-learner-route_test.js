import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { Membership } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Prescription | Organization Learner | Acceptance | Application | OrganizationLearnerRoute', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('GET /api/organizations/{organizationId}/attestations/{attestationKey}', function () {
    it('should return 200 status code and right content type', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.MEMBER,
      });
      const attestation = databaseBuilder.factory.buildAttestation();
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        division: '6emeA',
      });
      databaseBuilder.factory.buildProfileReward({
        userId: organizationLearner.userId,
        rewardId: attestation.id,
        rewardType: REWARD_TYPES.ATTESTATION,
      });

      await databaseBuilder.commit();

      const request = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/attestations/${attestation.key}?divisions[]=6emeA`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when

      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.equal('application/zip');
    });
  });
});
