import { JuryCertificationSummary } from '../../../../../../src/certification/session-management/domain/read-models/JuryCertificationSummary.js';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | JuryCertificationSummary', function () {
  describe('#constructor', function () {
    it('should return a JuryCertificationSummary', function () {
      // given
      const notImpactfulIssueReport = domainBuilder.buildCertificationIssueReport.notImpactful({ resolvedAt: null });
      const data = {
        certificationIssueReports: [notImpactfulIssueReport],
        completedAt: new Date('2020-01-01'),
        lastAnswerAt: new Date('2020-01-01'),
        createdAt: new Date('2020-01-02'),
        firstName: 'Mad',
        lastName: 'Martigan',
        algorithmVersion: AlgorithmEngineVersion.V3,
        id: 100001,
        isFlaggedAborted: false,
        isPublished: false,
        pixScore: 751,
        reachedMeshIndex: 6,
        status: 'started',
        eduV3ExternalJuryResult: 'coucou',
        certificationFramework: Frameworks.CORE,
      };

      // when
      const juryCertificationSummary = new JuryCertificationSummary(data);

      // then
      expect(juryCertificationSummary).to.deep.equal({
        certificationIssueReports: [notImpactfulIssueReport],
        completedAt: new Date('2020-01-01'),
        lastAnswerAt: new Date('2020-01-01'),
        createdAt: new Date('2020-01-02'),
        firstName: 'Mad',
        lastName: 'Martigan',
        id: 100001,
        isFlaggedAborted: false,
        isPublished: false,
        algorithmVersion: AlgorithmEngineVersion.V3,
        pixScore: 751,
        reachedMeshIndex: 6,
        status: 'started',
        certificationFramework: Frameworks.CORE,
        eduV3ExternalJuryResult: 'coucou',
      });
    });
  });

  describe('#validate', function () {
    context('when assessment is ended by invigilator', function () {
      it(`should returns "endedByInvigilator" status`, function () {
        // when
        const juryCertificationSummary = new JuryCertificationSummary({ isEndedByInvigilator: true });

        // then
        expect(juryCertificationSummary.status).equal('endedByInvigilator');
      });
    });

    context('when no status is given', function () {
      it('should return "started"', function () {
        // when
        const juryCertificationSummary = new JuryCertificationSummary({ status: null });

        // then
        expect(juryCertificationSummary.status).equal(Assessment.states.STARTED);
      });
    });
  });

  describe('#isFlaggedAborted', function () {
    context('when the certification has been scored while started', function () {
      context('with abort reason', function () {
        it('should return isFlaggedAborted true', function () {
          // when
          const juryCertificationSummary = new JuryCertificationSummary({
            abortReason: 'candidate',
            completedAt: null,
            pixScore: 456,
          });

          // then
          expect(juryCertificationSummary.isFlaggedAborted).equal(true);
        });
      });

      context('without abort reason', function () {
        it('should return isFlaggedAborted false', function () {
          // when
          const juryCertificationSummary = new JuryCertificationSummary({
            abortReason: null,
            completedAt: null,
            pixScore: 456,
          });

          // then
          expect(juryCertificationSummary.isFlaggedAborted).equal(false);
        });
      });
    });

    context('when the certification has been scored while completed', function () {
      context('with abort reason', function () {
        it('should return isFlaggedAborted false', function () {
          // when
          const juryCertificationSummary = new JuryCertificationSummary({
            abortReason: 'candidate',
            completedAt: new Date(),
            pixScore: 456,
          });

          // then
          expect(juryCertificationSummary.isFlaggedAborted).equal(false);
        });
      });
    });
  });

  describe('#isActionRequired', function () {
    context('when the issue report is unresolved', function () {
      context('when the issue report is impactful', function () {
        it('should return true', function () {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({
            certificationIssueReports: [domainBuilder.buildCertificationIssueReport.impactful({ resolvedAt: null })],
          });

          // when
          const isRequired = juryCertificationSummary.isActionRequired();

          // then
          expect(isRequired).to.be.true;
        });
      });

      context('when the issue report is not impactful', function () {
        it('should return false', function () {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({
            certificationIssueReports: [domainBuilder.buildCertificationIssueReport.notImpactful({ resolvedAt: null })],
          });

          // when
          const isRequired = juryCertificationSummary.isActionRequired();

          // then
          expect(isRequired).to.be.false;
        });
      });
    });

    context('when the issue report is resolved', function () {
      context('when the issue report is impactful', function () {
        it('should return false', function () {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({
            certificationIssueReports: [
              domainBuilder.buildCertificationIssueReport.impactful({
                resolvedAt: new Date('2020-01-01'),
                resolution: 'coucou',
              }),
            ],
          });

          // when
          const isRequired = juryCertificationSummary.isActionRequired();

          // then
          expect(isRequired).to.be.false;
        });
      });

      context('when the issue report is not impactful', function () {
        it('should return false', function () {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({
            certificationIssueReports: [
              domainBuilder.buildCertificationIssueReport.notImpactful({ resolvedAt: new Date('2020-01-01') }),
            ],
          });

          // when
          const isRequired = juryCertificationSummary.isActionRequired();

          // then
          expect(isRequired).to.be.false;
        });
      });
    });
  });

  describe('#hasScoringError', function () {
    context('when assessment result has a scoring error', function () {
      it('should return true', function () {
        // given
        const juryCertificationSummary = new JuryCertificationSummary({ status: AssessmentResult.status.ERROR });

        // when
        const hasScoringError = juryCertificationSummary.hasScoringError();

        // then
        expect(hasScoringError).to.be.true;
      });

      context("when assessment result doesn't have a scoring error", function () {
        it('should return false', function () {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({ status: AssessmentResult.status.VALIDATED });

          // when
          const hasScoringError = juryCertificationSummary.hasScoringError();

          // then
          expect(hasScoringError).to.be.false;
        });
      });
    });
  });

  describe('#hasCompletedAssessment', function () {
    context('when assessment is completed', function () {
      it('should return true', function () {
        // given
        const juryCertificationSummary = new JuryCertificationSummary({ status: AssessmentResult.status.REJECTED });

        // when
        const hasCompletedAssessment = juryCertificationSummary.hasCompletedAssessment();

        // then
        expect(hasCompletedAssessment).to.be.true;
      });

      context('when assessment is not completed', function () {
        it('should return false', function () {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({ status: null });

          // when
          const hasCompletedAssessment = juryCertificationSummary.hasCompletedAssessment();

          // then
          expect(hasCompletedAssessment).to.be.false;
        });
      });
    });
  });

  describe('#get reachedResultKey', function () {
    context('when certification is not v3', function () {
      it('returns the certification framework label followed by NONE', function () {
        const juryCertificationSummaryV1 = domainBuilder.certification.sessionManagement.buildJuryCertificationSummary({
          algorithmVersion: AlgorithmEngineVersion.V1,
          certificationFramework: Frameworks.CORE,
        });
        const juryCertificationSummaryV2 = domainBuilder.certification.sessionManagement.buildJuryCertificationSummary({
          algorithmVersion: AlgorithmEngineVersion.V2,
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
              const juryCertificationSummary =
                domainBuilder.certification.sessionManagement.buildJuryCertificationSummary({
                  certificationFramework: Frameworks.CORE,
                  algorithmVersion: AlgorithmEngineVersion.V3,
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
                const juryCertificationSummary =
                  domainBuilder.certification.sessionManagement.buildJuryCertificationSummary({
                    certificationFramework: Frameworks.EDU_1ER_DEGRE,
                    algorithmVersion: AlgorithmEngineVersion.V3,
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
              const juryCertificationSummary =
                domainBuilder.certification.sessionManagement.buildJuryCertificationSummary({
                  certificationFramework: Frameworks.DROIT,
                  algorithmVersion: AlgorithmEngineVersion.V3,
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
              const juryCertificationSummary =
                domainBuilder.certification.sessionManagement.buildJuryCertificationSummary({
                  certificationFramework: Frameworks.PRO_SANTE,
                  algorithmVersion: AlgorithmEngineVersion.V3,
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
});
