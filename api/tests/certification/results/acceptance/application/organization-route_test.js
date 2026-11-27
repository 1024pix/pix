import { expect } from 'chai';

import { CERTIFICATION_RESULT_STATUSES } from '../../../../../src/certification/results/domain/constants.ts';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { AutoJuryCommentKeys } from '../../../../../src/certification/shared/domain/models/JuryComment.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/AssessmentResult.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { getServer } from '../../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Results | Acceptance | Application | Routes | organization', function () {
  const BOM_CHAR = '\ufeff';
  let server;

  beforeEach(async function () {
    server = await getServer();
  });

  describe('GET /api/organizations/{organizationId}/certification-results', function () {
    let user, organization;
    beforeEach(function () {
      user = databaseBuilder.factory.buildUser.withRawPassword();
      organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: user.id,
        organizationRole: Membership.roles.ADMIN,
      });
      return databaseBuilder.commit();
    });

    context('FT readNewCertificationResults disabled', function () {
      beforeEach(async function () {
        await featureToggles.set('readNewCertificationResults', false);
      });

      it('should return HTTP status 200', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession({
          id: 10242048,
          publishedAt: new Date('2024-01-01'),
        }).id;

        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          division: 'aDivision',
        });
        const candidate = domainBuilder.certification.enrolment
          .candidateBuilder()
          .asReconciled()
          .asScoCandidate({
            organizationLearnerId: organizationLearner.id,
          })
          .withParameters({
            sessionId,
          })
          .insertToDB({ databaseBuilder });
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          id: 20484096,
          userId: candidate.userId,
          sessionId: candidate.sessionId,
          isPublished: true,
        });
        databaseBuilder.factory.buildAssessmentResult.last({
          pixScore: 0,
          status: AssessmentResult.status.CANCELLED,
          certificationCourseId: certificationCourse.id,
          commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
        });

        const organizationLearnerDidNotComeToTheSession = databaseBuilder.factory.buildOrganizationLearner({
          firstName: 'didNotCome',
          organizationId: organization.id,
          division: 'aDivision',
        });
        const candidateDidNotComeToTheSession = domainBuilder.certification.enrolment
          .candidateBuilder()
          .asScoCandidate({
            organizationLearnerId: organizationLearnerDidNotComeToTheSession.id,
          })
          .withParameters({
            sessionId,
          })
          .insertToDB({ databaseBuilder });
        databaseBuilder.factory.buildCertificationCourse({
          sessionId: candidateDidNotComeToTheSession.sessionId,
          isPublished: true,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/certification-results?division=aDivision`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.payload).to.equal(
          `${BOM_CHAR}"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Date de passage de la certification"\n20484096;"first-name";"last-name";"21/05/2001";"Paris";"externalId";"Pix";"Annulée";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"Un ou plusieurs problème(s) technique(s), a/ont affecté le bon déroulement du test de certification. Nous ne sommes pas en mesure de délivrer la certification, celle-ci est donc annulée. Cette information peut vous conduire à proposer une nouvelle session de certification pour ce(cette) candidat(e).";10242048;"01/01/2022"`,
        );
      });
    });

    context('FT readNewCertificationResults enabled', function () {
      beforeEach(async function () {
        await featureToggles.set('readNewCertificationResults', true);
      });

      it('should return HTTP status 200', async function () {
        // given
        databaseBuilder.factory.learningContent.buildCompetence({
          id: 'competenceABC123',
          index: '1.1',
          origin: 'Pix',
        });
        databaseBuilder.factory.learningContent.buildCompetence({
          id: 'competenceDEF456',
          index: '2.2',
          origin: 'Pix',
        });
        const sessionId = databaseBuilder.factory.buildSession({ id: 100000 }).id;
        buildCertificationResult(1, Frameworks.CORE, organization.id, sessionId, 10);
        buildCertificationResult(4, Frameworks.CLEA, organization.id, sessionId, 20);
        buildCertificationResult(5, Frameworks.DROIT, organization.id, sessionId, 30);
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/certification-results?division=aDivision`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep
          .equal(`\uFEFF"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Certification CléA";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Date de passage de la certification"
"1";"firstName 1";"lastName 1";"01/01/1990";"birthplace 1";"externalId 1";"Pix";"Non obtenue";"Non passée";"-";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"commentForOrganization 1";"100000";"02/02/2026"
"4";"firstName 4";"lastName 4";"01/01/1990";"birthplace 4";"externalId 4";"CléA Numérique by Pix";"Non obtenue";"Non obtenue";"-";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"commentForOrganization 4";"100000";"02/02/2026"
"5";"firstName 5";"lastName 5";"01/01/1990";"birthplace 5";"externalId 5";"Pix+ Droit";"Non obtenue";"Non passée";"-";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"commentForOrganization 5";"100000";"02/02/2026"`);
      });
    });
  });
});

function buildCertificationResult(certificationCourseId, framework, organizationId, sessionId, learnerId) {
  let pixScore = null,
    competenceMarks = null,
    competenceMarksForDBResult = null,
    hasAcquiredClea = null;
  if (framework === Frameworks.CORE || framework === Frameworks.CLEA) {
    pixScore = 678;
    competenceMarks = [
      {
        level: 1,
        competenceCode: '1.1',
      },
      {
        level: 7,
        competenceCode: '2.2',
      },
    ];
    competenceMarksForDBResult = [
      {
        level: 1,
        competenceId: 'competenceABC123',
      },
      {
        level: 7,
        competenceId: 'competenceDEF456',
      },
    ];
  }
  if (framework === Frameworks.CLEA) {
    hasAcquiredClea = true;
  }
  const data = {
    certificationId: certificationCourseId,
    firstName: `firstName ${certificationCourseId}`,
    lastName: `lastName ${certificationCourseId}`,
    birthdate: '1990-01-01',
    birthplace: `birthplace ${certificationCourseId}`,
    externalId: `externalId ${certificationCourseId}`,
    framework,
    status: CERTIFICATION_RESULT_STATUSES.REJECTED,
    reachedMeshIndex: 1,
    pixScore,
    competenceMarks,
    hasAcquiredClea,
    commentForOrganization: `commentForOrganization ${certificationCourseId}`,
    commentByAutoJury: null,
    certificationCenter: `certificationCenter ${certificationCourseId}`,
    startedAt: new Date('2026-02-02T15:00:00Z'),
    sessionId,
  };
  const userId = databaseBuilder.factory.buildUser().id;
  const candidateId = databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    userId,
  }).id;
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationCourseId,
    sessionId,
    userId,
    candidateId,
  });
  const certificationResultId = databaseBuilder.factory.buildCertificationResult({
    id: `20000002-2002-2002-2002-20000000000${certificationCourseId}`,
    firstName: data.firstName,
    lastName: data.lastName,
    birthdate: data.birthdate,
    birthplace: data.birthplace,
    externalId: data.externalId,
    framework: data.framework,
    status: data.status,
    reachedMeshIndex: data.reachedMeshIndex,
    pixScore: data.pixScore,
    competenceMarks: competenceMarksForDBResult,
    hasAcquiredClea: data.hasAcquiredClea,
    commentForOrganization: data.commentForOrganization,
    commentByAutoJury: data.commentByAutoJury,
    certificationCenter: data.certificationCenter,
    startedAt: data.startedAt,
  }).id;
  if (learnerId) {
    databaseBuilder.factory.buildOrganizationLearner({
      id: learnerId,
      organizationId,
      division: 'aDivision',
    });
  }
  databaseBuilder.factory.buildUserCertificationResult({
    userId,
    sessionId,
    certificationCourseId,
    certificationResultId,
    organizationLearnerId: learnerId,
  });
  return data;
}
