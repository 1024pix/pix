import { AssessmentResult } from '../../../../../lib/domain/models/index.js';
import { Membership } from '../../../../../lib/domain/models/Membership.js';
import { createServer } from '../../../../../server.js';
import { AutoJuryCommentKeys } from '../../../../../src/certification/shared/domain/models/JuryComment.js';
import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Certification | Course | Acceptance | Application | organization-controller', function () {
  const BOM_CHAR = '\ufeff';
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

      const sessionId = databaseBuilder.factory.buildSession({ id: 10242048, publishedAt: new Date('2024-01-01') }).id;

      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: 'aDivision',
      });
      const candidate = databaseBuilder.factory.buildCertificationCandidate({
        organizationLearnerId: organizationLearner.id,
        sessionId,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        id: 20484096,
        userId: candidate.userId,
        sessionId: candidate.sessionId,
        isPublished: true,
        isCancelled: true,
      });
      databaseBuilder.factory.buildAssessmentResult.last({
        pixScore: 0,
        status: AssessmentResult.status.REJECTED,
        certificationCourseId: certificationCourse.id,
        commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
      });

      const organizationLearnerDidNotComeToTheSession = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'didNotCome',
        organizationId: organization.id,
        division: 'aDivision',
      });
      const candidateDidNotComeToTheSession = databaseBuilder.factory.buildCertificationCandidate({
        organizationLearnerId: organizationLearnerDidNotComeToTheSession.id,
        sessionId,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateDidNotComeToTheSession.id });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId: candidateDidNotComeToTheSession.sessionId,
        isPublished: true,
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
      expect(response.payload).to.equal(
        `${BOM_CHAR}"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Date de passage de la certification"\n20484096;"first-name";"last-name";"21/05/2001";"Paris";"externalId";"Annulée";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"Un ou plusieurs problème(s) technique(s), a/ont affecté le bon déroulement du test de certification. Nous ne sommes pas en mesure de délivrer la certification, celle-ci est donc annulée. Cette information peut vous conduire à proposer une nouvelle session de certification pour ce(cette) candidat(e).";10242048;"01/01/2022"`,
      );
    });
  });
});
