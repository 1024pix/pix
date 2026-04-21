import { JuryCertification } from '../../../../../../src/certification/session-management/domain/models/JuryCertification.js';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { AutoJuryCommentKeys } from '../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | JuryCertification', function () {
  describe('#from', function () {
    let juryCertificationDTO;
    let competenceMarkDTOs;

    beforeEach(function () {
      juryCertificationDTO = {
        certificationCourseId: 123,
        sessionId: 456,
        userId: 789,
        assessmentId: 159,
        firstName: 'James',
        lastName: 'Watt',
        birthdate: '1990-01-04',
        birthplace: 'Somewhere',
        sex: 'M',
        birthCountry: 'ENGLAND',
        birthINSEECode: '99124',
        birthPostalCode: null,
        createdAt: new Date('2020-02-20T10:30:00Z'),
        completedAt: new Date('2020-02-20T11:00:00Z'),
        isPublished: true,
        isRejectedForFraud: false,
        assessmentResultStatus: 'rejected',
        juryId: 1,
        pixScore: 555,
        reachedMeshIndex: 5,
        eduV3ExternalJuryResult: null,
        commentForCandidate: 'coucou',
        commentForOrganization: 'comment',
        commentByJury: 'ça va',
        commentByAutoJury: null,
        version: 2,
        certificationFramework: Frameworks.CLEA,
        lastAnswerAt: new Date('2020-02-20T10:45:00Z'),
      };
      competenceMarkDTOs = [
        {
          id: 123,
          score: 10,
          level: 4,
          area_code: '2',
          competence_code: '2.3',
          assessmentResultId: 753,
          competenceId: 'recComp23',
        },
      ];
    });

    it('should return an instance of JuryCertification', function () {
      // given
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ id: 555 });
      const certificationIssueReports = [certificationIssueReport];
      const commonComplementaryCertificationCourseResult =
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertification({
          acquired: true,
        });

      const complementaryCertificationCourseResultWithExternal =
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
          complementaryCertificationCourseId: 123,
          pixComplementaryCertificationBadgeId: 98,
          pixAcquired: true,
          externalComplementaryCertificationBadgeId: 99,
          externalAcquired: true,
        });

      // when
      const juryCertification = JuryCertification.from({
        juryCertificationDTO,
        certificationIssueReports,
        competenceMarkDTOs,
        commonComplementaryCertificationCourseResult,
        complementaryCertificationCourseResultWithExternal,
      });

      // then
      const expectedCompetenceMarks = competenceMarkDTOs.map(domainBuilder.buildCompetenceMark);
      const expectedJuryCertification = domainBuilder.certification.sessionManagement.buildJuryCertification({
        certificationCourseId: 123,
        sessionId: 456,
        userId: 789,
        assessmentId: 159,
        firstName: 'James',
        lastName: 'Watt',
        birthdate: '1990-01-04',
        birthplace: 'Somewhere',
        sex: 'M',
        birthCountry: 'ENGLAND',
        birthINSEECode: '99124',
        birthPostalCode: null,
        createdAt: new Date('2020-02-20T10:30:00Z'),
        completedAt: new Date('2020-02-20T11:00:00Z'),
        isPublished: true,
        isRejectedForFraud: false,
        status: 'rejected',
        juryId: 1,
        pixScore: 555,
        commentForCandidate: 'coucou',
        commentForOrganization: 'comment',
        commentByJury: 'ça va',
        commentByAutoJury: null,
        version: 2,
        certificationFramework: Frameworks.CLEA,
        competenceMarks: expectedCompetenceMarks,
        certificationIssueReports,
        commonComplementaryCertificationCourseResult,
        complementaryCertificationCourseResultWithExternal,
        lastAnswerAt: new Date('2020-02-20T10:45:00Z'),
      });
      expect(juryCertification).to.deepEqualInstance(expectedJuryCertification);
    });

    it('should return an instance of JuryCertification with comment by auto jury', function () {
      // given
      juryCertificationDTO.commentByAutoJury = 'FRAUD';

      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ id: 555 });
      const certificationIssueReports = [certificationIssueReport];
      const commonComplementaryCertificationCourseResult =
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertification({
          acquired: true,
        });

      const complementaryCertificationCourseResultWithExternal =
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
          complementaryCertificationCourseId: 123,
          pixComplementaryCertificationBadgeId: 98,
          pixAcquired: true,
          externalComplementaryCertificationBadgeId: 99,
          externalAcquired: true,
        });

      // when
      const juryCertification = JuryCertification.from({
        juryCertificationDTO,
        certificationIssueReports,
        competenceMarkDTOs,
        commonComplementaryCertificationCourseResult,
        complementaryCertificationCourseResultWithExternal,
      });

      // then
      const expectedCompetenceMarks = competenceMarkDTOs.map(domainBuilder.buildCompetenceMark);
      const expectedJuryCertification = domainBuilder.certification.sessionManagement.buildJuryCertification({
        certificationCourseId: 123,
        sessionId: 456,
        userId: 789,
        assessmentId: 159,
        firstName: 'James',
        lastName: 'Watt',
        birthdate: '1990-01-04',
        birthplace: 'Somewhere',
        sex: 'M',
        birthCountry: 'ENGLAND',
        birthINSEECode: '99124',
        birthPostalCode: null,
        createdAt: new Date('2020-02-20T10:30:00Z'),
        completedAt: new Date('2020-02-20T11:00:00Z'),
        isPublished: true,
        isRejectedForFraud: false,
        status: 'rejected',
        juryId: 1,
        pixScore: 555,
        commentForCandidate: 'coucou',
        commentForOrganization: 'comment',
        commentByJury: 'ça va',
        commentByAutoJury: AutoJuryCommentKeys.FRAUD,
        version: 2,
        certificationFramework: Frameworks.CLEA,
        competenceMarks: expectedCompetenceMarks,
        certificationIssueReports,
        commonComplementaryCertificationCourseResult,
        complementaryCertificationCourseResultWithExternal,
        lastAnswerAt: new Date('2020-02-20T10:45:00Z'),
      });
      expect(juryCertification).to.deepEqualInstance(expectedJuryCertification);
    });
  });

  describe('#get reachedResultKey', function () {
    context('when certification is not v3', function () {
      it('returns the certification framework label followed by NONE', function () {
        const juryCertificationSummaryV1 = domainBuilder.certification.sessionManagement.buildJuryCertification({
          version: AlgorithmEngineVersion.V1,
          certificationFramework: Frameworks.CORE,
        });
        const juryCertificationSummaryV2 = domainBuilder.certification.sessionManagement.buildJuryCertification({
          version: AlgorithmEngineVersion.V2,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
        });

        const reachedResultKeyV1 = juryCertificationSummaryV1.reachedResultKey;
        const reachedResultKeyV2 = juryCertificationSummaryV2.reachedResultKey;

        expect(reachedResultKeyV1).to.equal('CORE.NONE');
        expect(reachedResultKeyV2).to.equal('EDU_1ER_DEGRE.NONE');
      });
    });

    context('when certification is v3', function () {
      context('CORE', function () {
        [
          { reachedMeshIndex: null, expectedReachedResultKey: 'CORE.BELOW_MINIMUM' },
          { reachedMeshIndex: 0, expectedReachedResultKey: 'CORE.0' },
          { reachedMeshIndex: 1, expectedReachedResultKey: 'CORE.1' },
          { reachedMeshIndex: 2, expectedReachedResultKey: 'CORE.2' },
          { reachedMeshIndex: 3, expectedReachedResultKey: 'CORE.3' },
          { reachedMeshIndex: 4, expectedReachedResultKey: 'CORE.4' },
          { reachedMeshIndex: 5, expectedReachedResultKey: 'CORE.5' },
          { reachedMeshIndex: 6, expectedReachedResultKey: 'CORE.6' },
          { reachedMeshIndex: 7, expectedReachedResultKey: 'CORE.7' },
          { reachedMeshIndex: 8, expectedReachedResultKey: 'CORE.8' },
        ].forEach(({ reachedMeshIndex, expectedReachedResultKey }) => {
          context(`when reachedMeshIndex is ${reachedMeshIndex}`, function () {
            it(`returns ${expectedReachedResultKey}`, function () {
              const juryCertificationSummary = domainBuilder.certification.sessionManagement.buildJuryCertification({
                certificationFramework: Frameworks.CORE,
                version: AlgorithmEngineVersion.V3,
                reachedMeshIndex,
              });

              const reachedResultKey = juryCertificationSummary.reachedResultKey;

              expect(reachedResultKey).to.equal(expectedReachedResultKey);
            });
          });
        });
      });

      context('EDU', function () {
        [
          {
            reachedMeshIndex: null,
            eduV3ExternalJuryResult: null,
            expectedReachedResultKey: 'EDU_1ER_DEGRE.BELOW_MINIMUM',
          },
          { reachedMeshIndex: 0, eduV3ExternalJuryResult: null, expectedReachedResultKey: 'EDU_1ER_DEGRE.0' },
          {
            reachedMeshIndex: 0,
            eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED,
            expectedReachedResultKey: 'EDU_1ER_DEGRE.ADVANCED',
          },
          {
            reachedMeshIndex: 0,
            eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
            expectedReachedResultKey: 'EDU_1ER_DEGRE.EXPERT',
          },
        ].forEach(({ reachedMeshIndex, eduV3ExternalJuryResult, expectedReachedResultKey }) => {
          context(
            `when reachedMeshIndex is ${reachedMeshIndex} and eduV3ExternalJuryResult is ${eduV3ExternalJuryResult}`,
            function () {
              it(`returns ${expectedReachedResultKey}`, function () {
                const juryCertificationSummary = domainBuilder.certification.sessionManagement.buildJuryCertification({
                  certificationFramework: Frameworks.EDU_1ER_DEGRE,
                  version: AlgorithmEngineVersion.V3,
                  eduV3ExternalJuryResult,
                  reachedMeshIndex,
                });

                const reachedResultKey = juryCertificationSummary.reachedResultKey;

                expect(reachedResultKey).to.equal(expectedReachedResultKey);
              });
            },
          );
        });
      });

      context('DROIT', function () {
        [
          {
            reachedMeshIndex: null,
            expectedReachedResultKey: 'DROIT.BELOW_MINIMUM',
          },
          { reachedMeshIndex: 0, expectedReachedResultKey: 'DROIT.0' },
        ].forEach(({ reachedMeshIndex, expectedReachedResultKey }) => {
          context(`when reachedMeshIndex is ${reachedMeshIndex}`, function () {
            it(`returns ${expectedReachedResultKey}`, function () {
              const juryCertificationSummary = domainBuilder.certification.sessionManagement.buildJuryCertification({
                certificationFramework: Frameworks.DROIT,
                version: AlgorithmEngineVersion.V3,
                reachedMeshIndex,
              });

              const reachedResultKey = juryCertificationSummary.reachedResultKey;

              expect(reachedResultKey).to.equal(expectedReachedResultKey);
            });
          });
        });
      });

      context('PRO SANTÉ', function () {
        [
          {
            reachedMeshIndex: null,
            expectedReachedResultKey: 'PRO_SANTE.BELOW_MINIMUM',
          },
          { reachedMeshIndex: 0, expectedReachedResultKey: 'PRO_SANTE.0' },
        ].forEach(({ reachedMeshIndex, expectedReachedResultKey }) => {
          context(`when reachedMeshIndex is ${reachedMeshIndex}`, function () {
            it(`returns ${expectedReachedResultKey}`, function () {
              const juryCertificationSummary = domainBuilder.certification.sessionManagement.buildJuryCertification({
                certificationFramework: Frameworks.PRO_SANTE,
                version: AlgorithmEngineVersion.V3,
                reachedMeshIndex,
              });

              const reachedResultKey = juryCertificationSummary.reachedResultKey;

              expect(reachedResultKey).to.equal(expectedReachedResultKey);
            });
          });
        });
      });
    });
  });

  describe('#updateEduV3ExternalJuryResult', function () {
    context('when certification is not published', function () {
      it('throws an error', function () {
        const juryCertificationSummary = domainBuilder.certification.sessionManagement.buildJuryCertification({
          version: AlgorithmEngineVersion.V3,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
          isPublished: false,
          reachedMeshIndex: 0,
          status: AssessmentResult.status.VALIDATED,
        });

        expect(() =>
          juryCertificationSummary.updateEduV3ExternalJuryResult(PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED),
        ).to.throw('Impossible de définir le résultat du volet externe pour une certification non publiée');
      });
    });

    context('when certification is not validated', function () {
      [AssessmentResult.status.ERROR, AssessmentResult.status.REJECTED, AssessmentResult.status.CANCELLED].forEach(
        function (assessmentResultStatus) {
          it(`throws an error when status is ${assessmentResultStatus}`, function () {
            const juryCertificationSummary = domainBuilder.certification.sessionManagement.buildJuryCertification({
              version: AlgorithmEngineVersion.V3,
              certificationFramework: Frameworks.EDU_1ER_DEGRE,
              isPublished: true,
              reachedMeshIndex: 0,
              status: assessmentResultStatus,
            });

            expect(() =>
              juryCertificationSummary.updateEduV3ExternalJuryResult(PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED),
            ).to.throw('Impossible de définir le résultat du volet externe pour une certification non validée');
          });
        },
      );
    });

    context('when certification is not v3', function () {
      it('throws an error', function () {
        const juryCertificationSummaryV1 = domainBuilder.certification.sessionManagement.buildJuryCertification({
          version: AlgorithmEngineVersion.V2,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
          isPublished: true,
          reachedMeshIndex: 0,
          status: AssessmentResult.status.VALIDATED,
        });
        const juryCertificationSummaryV2 = domainBuilder.certification.sessionManagement.buildJuryCertification({
          version: AlgorithmEngineVersion.V2,
          certificationFramework: Frameworks.EDU_CPE,
          isPublished: true,
          reachedMeshIndex: 0,
          status: AssessmentResult.status.VALIDATED,
        });

        expect(() =>
          juryCertificationSummaryV1.updateEduV3ExternalJuryResult(PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED),
        ).to.throw('Impossible de définir le résultat du volet externe pour une certification non V3');

        expect(() =>
          juryCertificationSummaryV2.updateEduV3ExternalJuryResult(PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED),
        ).to.throw('Impossible de définir le résultat du volet externe pour une certification non V3');
      });
    });

    context('when certification is not "EDU"', function () {
      [Frameworks.CORE, Frameworks.CLEA, Frameworks.DROIT, Frameworks.PRO_SANTE].forEach(function (framework) {
        it(`throws an error when certification is ${framework}`, function () {
          const juryCertificationSummary = domainBuilder.certification.sessionManagement.buildJuryCertification({
            version: AlgorithmEngineVersion.V3,
            certificationFramework: framework,
            isPublished: true,
            reachedMeshIndex: 0,
            status: AssessmentResult.status.VALIDATED,
          });

          expect(() =>
            juryCertificationSummary.updateEduV3ExternalJuryResult(PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED),
          ).to.throw('Impossible de définir le résultat du volet externe pour une certification non "EDU"');
        });
      });
    });

    context('when certification is "Non admissible"', function () {
      it('throws an error', function () {
        const juryCertificationSummary = domainBuilder.certification.sessionManagement.buildJuryCertification({
          version: AlgorithmEngineVersion.V3,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
          isPublished: true,
          reachedMeshIndex: null,
          status: AssessmentResult.status.VALIDATED,
        });

        expect(() =>
          juryCertificationSummary.updateEduV3ExternalJuryResult(PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED),
        ).to.throw('Impossible de définir le résultat du volet externe pour une certification EDU non admissible');
      });
    });

    context('when all conditions are reunited', function () {
      [Frameworks.EDU_CPE, Frameworks.EDU_1ER_DEGRE, Frameworks.EDU_2ND_DEGRE].forEach(function (framework) {
        it(`update the edu v3 external jury result value when certification is ${framework}`, function () {
          const juryCertificationSummary = domainBuilder.certification.sessionManagement.buildJuryCertification({
            version: AlgorithmEngineVersion.V3,
            certificationFramework: framework,
            isPublished: true,
            reachedMeshIndex: 0,
            eduV3ExternalJuryResult: null,
            status: AssessmentResult.status.VALIDATED,
          });

          juryCertificationSummary.updateEduV3ExternalJuryResult(PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED);

          expect(juryCertificationSummary).to.deepEqualInstance(
            domainBuilder.certification.sessionManagement.buildJuryCertification({
              version: AlgorithmEngineVersion.V3,
              certificationFramework: framework,
              isPublished: true,
              reachedMeshIndex: 0,
              eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED,
              status: AssessmentResult.status.VALIDATED,
            }),
          );
        });
      });
    });
  });
});
