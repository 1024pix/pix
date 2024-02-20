import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

import { createServer } from '../../../../../server.js';
import { Membership } from '../../../../../lib/domain/models/Membership.js';
import { AutoJuryCommentKeys } from '../../../../../src/certification/shared/domain/models/JuryComment.js';

describe('Certification | Course | Acceptance | Application | organization-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('GET /api/organizations/{id}/certification-results', function () {
    it('should return HTTP status 200', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRawPassword();

      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: user.id,
        organizationRole: Membership.roles.ADMIN,
      });

      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: 'aDivision',
      });
      const candidate = databaseBuilder.factory.buildCertificationCandidate({
        organizationLearnerId: organizationLearner.id,
      });
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        userId: candidate.userId,
        sessionId: candidate.sessionId,
        isPublished: true,
      });

      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: certificationCourse.id,
        commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/certification-results?division=aDivision`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
