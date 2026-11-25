import { expect } from 'chai';
import sinon from 'sinon';

import { CERTIFICATION_RESULT_STATUSES } from '../../../../../../../src/certification/results/domain/constants.ts';
import { CertificationResultFactory } from '../../../../../../../src/certification/results/domain/models/factories/CertificationResultFactory.ts';
import {
  CertificationResult,
  UserCertificationResult,
} from '../../../../../../../src/certification/results/domain/models/NewCertificationResult.ts';
import { AlgorithmEngineVersion } from '../../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';

describe('Certification | Results | Unit | Domain | Models | Factories | CertificationResultFactory', function () {
  describe('#buildAll', function () {
    let uuidGenerator = () => '00000000-0000-4000-8000-000000000001';
    const baseCertificationData = {
      certificationCourseId: 111,
      userId: 222,
      sessionId: 333,
      firstName: 'Buffy',
      lastName: 'Summers',
      externalId: 'the_slayer',
      birthdate: '1981-01-18',
      birthplace: 'Sunnydale',
      birthPostalCode: 'SomePostalCode',
      birthINSEECode: 'SomeINSEECode',
      birthCountry: 'USA',
      verificationCode: 'VERIFCODE',
      certificationCenter: 'Centre certification le meilleur',
      startedAt: new Date('2025-12-30'),
      deliveredAt: new Date('2025-12-31'),
      status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
      commentByAutoJury: 'commentByAutoJury',
      commentByJury: 'commentByJury',
      commentForOrganization: 'commentForOrganization',
      commentForCandidate: 'commentForCandidate',
    };

    context('common data', function () {
      const baseResults = {
        maxReachableLevel: 7,
        pixScore: 678,
        reachedMeshIndex: 3,
        competenceMarks: [
          {
            level: 1,
            competenceId: 'competenceABC123',
          },
          {
            level: 7,
            competenceId: 'competenceDEF456',
          },
        ],
        v3EduExternalJuryResult: null,
      };

      context('common', function () {
        it('fills the common data attributes from the certification item provided and builds an ID for it', function () {
          const certificationData = [
            {
              ...baseCertificationData,
              ...baseResults,
              algorithmEngineVersion: AlgorithmEngineVersion.V3,
              framework: Frameworks.CORE,
            },
          ];

          const { certificationResults, userCertificationResults, errors } = CertificationResultFactory.buildAll(
            {
              certificationData,
              learnerData: [],
              cleaData: [],
              pixPlusV2VoletPixData: [],
              pixPlusV2VoletExterneData: [],
            },
            uuidGenerator,
          );

          sinon.assert.match(certificationResults, [
            sinon.match({
              id: '00000000-0000-4000-8000-000000000001',
              algorithmEngineVersion: AlgorithmEngineVersion.V3,
              firstName: 'Buffy',
              lastName: 'Summers',
              externalId: 'the_slayer',
              birthdate: '1981-01-18',
              birthplace: 'Sunnydale',
              birthPostalCode: 'SomePostalCode',
              birthINSEECode: 'SomeINSEECode',
              birthCountry: 'USA',
              verificationCode: 'VERIFCODE',
              certificationCenter: 'Centre certification le meilleur',
              startedAt: new Date('2025-12-30'),
              deliveredAt: new Date('2025-12-31'),
              status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
              framework: Frameworks.CORE,
              franceCompetencesMinScore: 120,
              commentByAutoJury: 'commentByAutoJury',
              commentByJury: 'commentByJury',
              commentForOrganization: 'commentForOrganization',
              commentForCandidate: 'commentForCandidate',
            }),
          ]);
          expect(userCertificationResults).to.deep.equal([
            new UserCertificationResult({
              certificationCourseId: 111,
              userId: 222,
              sessionId: 333,
              certificationResultId: '00000000-0000-4000-8000-000000000001',
              organizationLearnerId: null,
            }),
          ]);
          expect(errors).to.deep.equal({});
        });

        it('builds a certification result for a certification cancelled by jury', function () {
          const certificationData = [
            {
              ...baseCertificationData,
              ...baseResults,
              status: CERTIFICATION_RESULT_STATUSES.CANCELLED_BY_JURY,
              algorithmEngineVersion: AlgorithmEngineVersion.V3,
              framework: Frameworks.CORE,
            },
          ];

          const { certificationResults, errors } = CertificationResultFactory.buildAll(
            {
              certificationData,
              learnerData: [],
              cleaData: [],
              pixPlusV2VoletPixData: [],
              pixPlusV2VoletExterneData: [],
            },
            uuidGenerator,
          );

          sinon.assert.match(certificationResults, [
            sinon.match({ status: CERTIFICATION_RESULT_STATUSES.CANCELLED_BY_JURY }),
          ]);
          expect(errors).to.deep.equal({});
        });
      });

      context('learner data', function () {
        context('when no learner matches the organization learner of the certification', function () {
          it('builds a certificationResult and a userCertificationResult with no additional info on candidate identity (middle/third names and national student ID)', function () {
            const certificationData = [
              {
                ...baseCertificationData,
                ...baseResults,
                organizationLearnerId: 444,
                algorithmEngineVersion: AlgorithmEngineVersion.V3,
                framework: Frameworks.CORE,
              },
            ];
            const learnerData = [
              {
                organizationLearnerId: 1000,
                middleName: 'Ann',
                thirdName: 'Joan',
                nationalStudentId: 'xXSlayerXx',
              },
            ];

            const { certificationResults, userCertificationResults, errors } = CertificationResultFactory.buildAll(
              {
                certificationData,
                learnerData,
                cleaData: [],
                pixPlusV2VoletPixData: [],
                pixPlusV2VoletExterneData: [],
              },
              uuidGenerator,
            );

            sinon.assert.match(certificationResults, [
              sinon.match({
                middleName: null,
                thirdName: null,
                nationalStudentId: null,
              }),
            ]);
            expect(userCertificationResults).to.deep.equal([
              new UserCertificationResult({
                certificationCourseId: 111,
                userId: 222,
                sessionId: 333,
                certificationResultId: '00000000-0000-4000-8000-000000000001',
                organizationLearnerId: null,
              }),
            ]);
            expect(errors).to.deep.equal({});
          });
        });

        context('when a learner matches the organization learner of the certification', function () {
          it('builds a certificationResult and a userCertificationResult filling additional info on candidate identity (middle/third names and national student ID)', function () {
            const certificationData = [
              {
                ...baseCertificationData,
                ...baseResults,
                organizationLearnerId: 444,
                algorithmEngineVersion: AlgorithmEngineVersion.V3,
                framework: Frameworks.CORE,
              },
            ];
            const learnerData = [
              {
                organizationLearnerId: 444,
                middleName: 'Ann',
                thirdName: 'Joan',
                nationalStudentId: 'xXSlayerXx',
              },
            ];

            const { certificationResults, userCertificationResults, errors } = CertificationResultFactory.buildAll(
              {
                certificationData,
                learnerData,
                cleaData: [],
                pixPlusV2VoletPixData: [],
                pixPlusV2VoletExterneData: [],
              },
              uuidGenerator,
            );

            sinon.assert.match(certificationResults, [
              sinon.match({
                middleName: 'Ann',
                thirdName: 'Joan',
                nationalStudentId: 'xXSlayerXx',
              }),
            ]);
            expect(userCertificationResults).to.deep.equal([
              new UserCertificationResult({
                certificationCourseId: 111,
                userId: 222,
                sessionId: 333,
                certificationResultId: '00000000-0000-4000-8000-000000000001',
                organizationLearnerId: 444,
              }),
            ]);
            expect(errors).to.deep.equal({});
          });
        });
      });

      context('france competences min score', function () {
        const cleaItem = {
          certificationCourseId: 111,
          cleaBadgeId: 999,
          hasAcquiredClea: true,
        };
        const pixPlusV2VoletPixItem = {
          certificationCourseId: 111,
          v2ComplementaryVoletPixBadgeId: 999,
          v2ComplementaryVoletPixAcquired: true,
        };
        context('when certification is CORE V1', function () {
          it('has no franceCompetencesMinScore', function () {
            const certificationData = [
              {
                ...baseCertificationData,
                ...baseResults,
                birthPostalCode: null,
                birthINSEECode: null,
                birthCountry: null,
                franceCompetencesMinScore: null,
                commentByAutoJury: null,
                deliveredAt: new Date('2026-12-31'),
                algorithmEngineVersion: AlgorithmEngineVersion.V1,
                framework: Frameworks.CORE,
              },
            ];

            const { certificationResults, errors } = CertificationResultFactory.buildAll(
              {
                certificationData,
                learnerData: [],
                cleaData: [],
                pixPlusV2VoletPixData: [],
                pixPlusV2VoletExterneData: [],
              },
              uuidGenerator,
            );

            sinon.assert.match(certificationResults, [
              sinon.match({
                franceCompetencesMinScore: null,
              }),
            ]);
            expect(errors).to.deep.equal({});
          });
        });

        context('when certification is V2', function () {
          context('when certification was delivered prior to FRANCE_COMPETENCES_PROFESSIONAL_START_DATE', function () {
            Object.values(Frameworks).forEach((framework) => {
              it(`has no franceCompetencesMinScore for framework ${framework}`, function () {
                const certificationData = [
                  {
                    ...baseCertificationData,
                    ...baseResults,
                    deliveredAt: new Date('2021-12-31'),
                    algorithmEngineVersion: AlgorithmEngineVersion.V2,
                    framework,
                  },
                ];

                const { certificationResults, errors } = CertificationResultFactory.buildAll(
                  {
                    certificationData,
                    learnerData: [],
                    cleaData: [cleaItem],
                    pixPlusV2VoletPixData: [pixPlusV2VoletPixItem],
                    pixPlusV2VoletExterneData: [],
                  },
                  uuidGenerator,
                );
                sinon.assert.match(certificationResults, [
                  sinon.match({
                    franceCompetencesMinScore: null,
                  }),
                ]);
                expect(errors).to.deep.equal({});
              });
            });
          });

          context('when certification was delivered after FRANCE_COMPETENCES_PROFESSIONAL_START_DATE', function () {
            [
              { framework: Frameworks.CORE, expectedFranceCompetencesMinScore: 120 },
              { framework: Frameworks.CLEA, expectedFranceCompetencesMinScore: 120 },
              { framework: Frameworks.DROIT, expectedFranceCompetencesMinScore: null },
              { framework: Frameworks.PRO_SANTE, expectedFranceCompetencesMinScore: null },
              { framework: Frameworks.EDU_CPE, expectedFranceCompetencesMinScore: null },
              { framework: Frameworks.EDU_2ND_DEGRE, expectedFranceCompetencesMinScore: null },
              { framework: Frameworks.EDU_1ER_DEGRE, expectedFranceCompetencesMinScore: null },
            ].forEach(({ framework, expectedFranceCompetencesMinScore }) => {
              it(`has franceCompetencesMinScore at ${expectedFranceCompetencesMinScore} for framework ${framework}`, function () {
                const certificationData = [
                  {
                    ...baseCertificationData,
                    ...baseResults,
                    deliveredAt: new Date('2025-12-31'),
                    algorithmEngineVersion: AlgorithmEngineVersion.V2,
                    framework,
                  },
                ];

                const { certificationResults, errors } = CertificationResultFactory.buildAll(
                  {
                    certificationData,
                    learnerData: [],
                    cleaData: [cleaItem],
                    pixPlusV2VoletPixData: [pixPlusV2VoletPixItem],
                    pixPlusV2VoletExterneData: [],
                  },
                  uuidGenerator,
                );

                sinon.assert.match(certificationResults, [
                  sinon.match({
                    franceCompetencesMinScore: expectedFranceCompetencesMinScore,
                  }),
                ]);
                expect(errors).to.deep.equal({});
              });
            });
          });
        });

        context('when certification is V3', function () {
          context('when certification was delivered prior to FRANCE_COMPETENCES_PROFESSIONAL_START_DATE', function () {
            Object.values(Frameworks).forEach((framework) => {
              it(`has no franceCompetencesMinScore for framework ${framework}`, function () {
                const certificationData = [
                  {
                    ...baseCertificationData,
                    ...baseResults,
                    deliveredAt: new Date('2021-12-31'),
                    algorithmEngineVersion: AlgorithmEngineVersion.V3,
                    framework,
                  },
                ];

                const { certificationResults, errors } = CertificationResultFactory.buildAll(
                  {
                    certificationData,
                    learnerData: [],
                    cleaData: [cleaItem],
                    pixPlusV2VoletPixData: [],
                    pixPlusV2VoletExterneData: [],
                  },
                  uuidGenerator,
                );
                sinon.assert.match(certificationResults, [
                  sinon.match({
                    franceCompetencesMinScore: null,
                  }),
                ]);
                expect(errors).to.deep.equal({});
              });
            });
          });

          context('when certification was delivered after FRANCE_COMPETENCES_PROFESSIONAL_START_DATE', function () {
            [
              { framework: Frameworks.CORE, expectedFranceCompetencesMinScore: 120 },
              { framework: Frameworks.CLEA, expectedFranceCompetencesMinScore: 120 },
              { framework: Frameworks.DROIT, expectedFranceCompetencesMinScore: null },
              { framework: Frameworks.PRO_SANTE, expectedFranceCompetencesMinScore: null },
              { framework: Frameworks.EDU_CPE, expectedFranceCompetencesMinScore: null },
              { framework: Frameworks.EDU_2ND_DEGRE, expectedFranceCompetencesMinScore: null },
              { framework: Frameworks.EDU_1ER_DEGRE, expectedFranceCompetencesMinScore: null },
            ].forEach(({ framework, expectedFranceCompetencesMinScore }) => {
              it(`has franceCompetencesMinScore at ${expectedFranceCompetencesMinScore} for framework ${framework}`, function () {
                const certificationData = [
                  {
                    ...baseCertificationData,
                    ...baseResults,
                    deliveredAt: new Date('2025-12-31'),
                    algorithmEngineVersion: AlgorithmEngineVersion.V3,
                    framework,
                  },
                ];

                const { certificationResults, errors } = CertificationResultFactory.buildAll(
                  {
                    certificationData,
                    learnerData: [],
                    cleaData: [cleaItem],
                    pixPlusV2VoletPixData: [],
                    pixPlusV2VoletExterneData: [],
                  },
                  uuidGenerator,
                );

                sinon.assert.match(certificationResults, [
                  sinon.match({
                    franceCompetencesMinScore: expectedFranceCompetencesMinScore,
                  }),
                ]);
                expect(errors).to.deep.equal({});
              });
            });
          });
        });
      });
    });

    context('multiple certifications', function () {
      it('builds multiple certification results', function () {
        const certificationItemForCoreV1 = {
          ...buildCertificationData(1),
          birthPostalCode: null,
          birthINSEECode: null,
          birthCountry: null,
          commentByAutoJury: null,
          algorithmEngineVersion: AlgorithmEngineVersion.V1,
          framework: Frameworks.CORE,
          pixScore: 11,
          competenceMarks: buildCompetenceMarks(1),
        };
        const certificationItemForCoreV2 = {
          ...buildCertificationData(2),
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
          framework: Frameworks.CORE,
          organizationLearnerId: 222,
          pixScore: 22,
          competenceMarks: buildCompetenceMarks(2),
        };
        const certificationItemForCleaV2 = {
          ...buildCertificationData(3),
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
          framework: Frameworks.CLEA,
          organizationLearnerId: 333,
          pixScore: 33,
          competenceMarks: buildCompetenceMarks(3),
        };
        const certificationItemForDroitV2 = {
          ...buildCertificationData(4),
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
          framework: Frameworks.DROIT,
          organizationLearnerId: null,
          pixScore: 44,
          competenceMarks: buildCompetenceMarks(4),
        };
        const certificationItemForEduV2 = {
          ...buildCertificationData(5),
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
          framework: Frameworks.EDU_2ND_DEGRE,
          organizationLearnerId: null,
          pixScore: 55,
          competenceMarks: buildCompetenceMarks(5),
        };
        const certificationItemForCoreV3 = {
          ...buildCertificationData(6),
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          framework: Frameworks.CORE,
          organizationLearnerId: 666,
          pixScore: 66,
          competenceMarks: buildCompetenceMarks(6),
          reachedMeshIndex: 3,
          maxReachableLevel: 7,
        };
        const certificationItemForCleaV3 = {
          ...buildCertificationData(7),
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          framework: Frameworks.CLEA,
          organizationLearnerId: null,
          pixScore: 77,
          competenceMarks: buildCompetenceMarks(7),
          reachedMeshIndex: 3,
          maxReachableLevel: 7,
        };
        const certificationItemForProSanteV3 = {
          ...buildCertificationData(8),
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          framework: Frameworks.PRO_SANTE,
          organizationLearnerId: null,
          reachedMeshIndex: 3,
          maxReachableLevel: 7,
        };

        const certificationData = [
          certificationItemForCoreV1,
          certificationItemForCoreV2,
          certificationItemForCleaV2,
          certificationItemForDroitV2,
          certificationItemForEduV2,
          certificationItemForCoreV3,
          certificationItemForCleaV3,
          certificationItemForProSanteV3,
        ];
        const learnerData = [
          {
            organizationLearnerId: 222,
            middleName: 'middleName_222',
            thirdName: 'thirdName_222',
            nationalStudentId: 'nationalStudentId_222',
          },
          {
            organizationLearnerId: 333,
            middleName: 'middleName_333',
            thirdName: 'thirdName_333',
            nationalStudentId: 'nationalStudentId_333',
          },
          {
            organizationLearnerId: 666,
            middleName: 'middleName_666',
            thirdName: 'thirdName_666',
            nationalStudentId: 'nationalStudentId_666',
          },
        ];
        const cleaData = [
          {
            certificationCourseId: 3,
            hasAcquiredClea: false,
            cleaBadgeId: 333,
          },
          {
            certificationCourseId: 7,
            hasAcquiredClea: true,
            cleaBadgeId: 777,
          },
        ];
        const pixPlusV2VoletPixData = [
          {
            certificationCourseId: 4,
            v2ComplementaryVoletPixBadgeId: 444,
            v2ComplementaryVoletPixAcquired: true,
          },
          {
            certificationCourseId: 5,
            v2ComplementaryVoletPixBadgeId: 555,
            v2ComplementaryVoletPixAcquired: true,
          },
        ];
        const pixPlusV2VoletExterneData = [
          {
            certificationCourseId: 5,
            v2EduVoletExterneBadgeId: 556,
            v2EduVoletExterneAcquired: true,
          },
        ];

        uuidGenerator = sinon.stub();
        uuidGenerator.onCall(0).returns('00000000-0000-4000-8000-000000000001');
        uuidGenerator.onCall(1).returns('00000000-0000-4000-8000-000000000002');
        uuidGenerator.onCall(2).returns('00000000-0000-4000-8000-000000000003');
        uuidGenerator.onCall(3).returns('00000000-0000-4000-8000-000000000004');
        uuidGenerator.onCall(4).returns('00000000-0000-4000-8000-000000000005');
        uuidGenerator.onCall(5).returns('00000000-0000-4000-8000-000000000006');
        uuidGenerator.onCall(6).returns('00000000-0000-4000-8000-000000000007');
        uuidGenerator.onCall(7).returns('00000000-0000-4000-8000-000000000008');
        const { certificationResults, userCertificationResults, errors } = CertificationResultFactory.buildAll(
          {
            certificationData,
            learnerData,
            cleaData,
            pixPlusV2VoletPixData,
            pixPlusV2VoletExterneData,
          },
          uuidGenerator,
        );

        expect(errors).to.deep.equal({});
        expect(certificationResults).to.deep.equal([
          new CertificationResult({
            ...certificationItemForCoreV1,
            id: '00000000-0000-4000-8000-000000000001',
            middleName: null,
            thirdName: null,
            nationalStudentId: null,
            franceCompetencesMinScore: null,
            results: {
              pixScore: certificationItemForCoreV1.pixScore,
              competenceMarks: certificationItemForCoreV1.competenceMarks,
            },
          }),
          new CertificationResult({
            ...certificationItemForCoreV2,
            id: '00000000-0000-4000-8000-000000000002',
            middleName: 'middleName_222',
            thirdName: 'thirdName_222',
            nationalStudentId: 'nationalStudentId_222',
            franceCompetencesMinScore: 120,
            results: {
              pixScore: certificationItemForCoreV2.pixScore,
              competenceMarks: certificationItemForCoreV2.competenceMarks,
            },
          }),
          new CertificationResult({
            ...certificationItemForCleaV2,
            id: '00000000-0000-4000-8000-000000000003',
            middleName: 'middleName_333',
            thirdName: 'thirdName_333',
            nationalStudentId: 'nationalStudentId_333',
            franceCompetencesMinScore: 120,
            results: {
              pixScore: certificationItemForCleaV2.pixScore,
              competenceMarks: certificationItemForCleaV2.competenceMarks,
              hasAcquiredClea: false,
              cleaBadgeId: 333,
            },
          }),
          new CertificationResult({
            ...certificationItemForDroitV2,
            id: '00000000-0000-4000-8000-000000000004',
            middleName: null,
            thirdName: null,
            nationalStudentId: null,
            franceCompetencesMinScore: null,
            results: {
              pixScore: certificationItemForDroitV2.pixScore,
              competenceMarks: certificationItemForDroitV2.competenceMarks,
              v2ComplementaryVoletPixBadgeId: 444,
              v2ComplementaryVoletPixAcquired: true,
            },
          }),
          new CertificationResult({
            ...certificationItemForEduV2,
            id: '00000000-0000-4000-8000-000000000005',
            middleName: null,
            thirdName: null,
            nationalStudentId: null,
            franceCompetencesMinScore: null,
            results: {
              pixScore: certificationItemForEduV2.pixScore,
              competenceMarks: certificationItemForEduV2.competenceMarks,
              v2ComplementaryVoletPixBadgeId: 555,
              v2ComplementaryVoletPixAcquired: true,
              v2EduVoletExterneBadgeId: 556,
              v2EduVoletExterneAcquired: true,
            },
          }),
          new CertificationResult({
            ...certificationItemForCoreV3,
            id: '00000000-0000-4000-8000-000000000006',
            middleName: 'middleName_666',
            thirdName: 'thirdName_666',
            nationalStudentId: 'nationalStudentId_666',
            franceCompetencesMinScore: 120,
            results: {
              competenceMarks: certificationItemForCoreV3.competenceMarks,
              pixScore: certificationItemForCoreV3.pixScore,
              reachedMeshIndex: certificationItemForCoreV3.reachedMeshIndex,
              maxReachableLevel: certificationItemForCoreV3.maxReachableLevel,
            },
          }),
          new CertificationResult({
            ...certificationItemForCleaV3,
            id: '00000000-0000-4000-8000-000000000007',
            middleName: null,
            thirdName: null,
            nationalStudentId: null,
            franceCompetencesMinScore: 120,
            results: {
              competenceMarks: certificationItemForCleaV3.competenceMarks,
              pixScore: certificationItemForCleaV3.pixScore,
              reachedMeshIndex: certificationItemForCleaV3.reachedMeshIndex,
              maxReachableLevel: certificationItemForCleaV3.maxReachableLevel,
              hasAcquiredClea: true,
              cleaBadgeId: 777,
            },
          }),
          new CertificationResult({
            ...certificationItemForProSanteV3,
            id: '00000000-0000-4000-8000-000000000008',
            middleName: null,
            thirdName: null,
            nationalStudentId: null,
            franceCompetencesMinScore: null,
            results: {
              reachedMeshIndex: certificationItemForProSanteV3.reachedMeshIndex,
              maxReachableLevel: certificationItemForProSanteV3.maxReachableLevel,
            },
          }),
        ]);
        expect(userCertificationResults).to.deep.equal([
          new UserCertificationResult({
            certificationCourseId: 1,
            userId: 2,
            sessionId: 3,
            certificationResultId: '00000000-0000-4000-8000-000000000001',
            organizationLearnerId: null,
          }),
          new UserCertificationResult({
            certificationCourseId: 2,
            userId: 3,
            sessionId: 4,
            certificationResultId: '00000000-0000-4000-8000-000000000002',
            organizationLearnerId: 222,
          }),
          new UserCertificationResult({
            certificationCourseId: 3,
            userId: 4,
            sessionId: 5,
            certificationResultId: '00000000-0000-4000-8000-000000000003',
            organizationLearnerId: 333,
          }),
          new UserCertificationResult({
            certificationCourseId: 4,
            userId: 5,
            sessionId: 6,
            certificationResultId: '00000000-0000-4000-8000-000000000004',
            organizationLearnerId: null,
          }),
          new UserCertificationResult({
            certificationCourseId: 5,
            userId: 6,
            sessionId: 7,
            certificationResultId: '00000000-0000-4000-8000-000000000005',
            organizationLearnerId: null,
          }),
          new UserCertificationResult({
            certificationCourseId: 6,
            userId: 7,
            sessionId: 8,
            certificationResultId: '00000000-0000-4000-8000-000000000006',
            organizationLearnerId: 666,
          }),
          new UserCertificationResult({
            certificationCourseId: 7,
            userId: 8,
            sessionId: 9,
            certificationResultId: '00000000-0000-4000-8000-000000000007',
            organizationLearnerId: null,
          }),
          new UserCertificationResult({
            certificationCourseId: 8,
            userId: 9,
            sessionId: 10,
            certificationResultId: '00000000-0000-4000-8000-000000000008',
            organizationLearnerId: null,
          }),
        ]);
      });

      it('builds multiple certification results except for those in errors, returns errors encountered per certification course id', function () {
        const certificationItemForCoreV1 = {
          ...buildCertificationData(1),
          birthPostalCode: null,
          birthINSEECode: null,
          birthCountry: null,
          commentByAutoJury: null,
          algorithmEngineVersion: AlgorithmEngineVersion.V1,
          framework: Frameworks.CORE,
          pixScore: 11,
          competenceMarks: buildCompetenceMarks(1),
        };
        const certificationItemForBrokenCoreV2 = {
          ...buildCertificationData(2),
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
          framework: Frameworks.CORE,
          organizationLearnerId: 222,
          competenceMarks: buildCompetenceMarks(2),
        };
        const certificationItemForCleaV2 = {
          ...buildCertificationData(3),
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
          framework: Frameworks.CLEA,
          organizationLearnerId: 333,
          pixScore: 33,
          competenceMarks: buildCompetenceMarks(3),
        };
        const certificationItemForBrokenDroitV2 = {
          ...buildCertificationData(4),
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
          framework: Frameworks.DROIT,
          organizationLearnerId: null,
          pixScore: 44,
          competenceMarks: buildCompetenceMarks(4),
        };

        const certificationData = [
          certificationItemForCoreV1,
          certificationItemForBrokenCoreV2,
          certificationItemForCleaV2,
          certificationItemForBrokenDroitV2,
        ];
        const learnerData = [
          {
            organizationLearnerId: 222,
            middleName: 'middleName_222',
            thirdName: 'thirdName_222',
            nationalStudentId: 'nationalStudentId_222',
          },
          {
            organizationLearnerId: 333,
            middleName: 'middleName_333',
            thirdName: 'thirdName_333',
            nationalStudentId: 'nationalStudentId_333',
          },
        ];
        const cleaData = [
          {
            certificationCourseId: 3,
            hasAcquiredClea: false,
            cleaBadgeId: 333,
          },
        ];
        const pixPlusV2VoletPixData = [
          {
            certificationCourseId: 4,
            v2ComplementaryVoletPixAcquired: true,
          },
        ];
        const pixPlusV2VoletExterneData = [];

        uuidGenerator = sinon.stub();
        uuidGenerator.onCall(0).returns('00000000-0000-4000-8000-000000000001');
        uuidGenerator.onCall(1).returns('00000000-0000-4000-8000-000000000002');
        uuidGenerator.onCall(2).returns('00000000-0000-4000-8000-000000000003');
        uuidGenerator.onCall(3).returns('00000000-0000-4000-8000-000000000004');
        const { certificationResults, userCertificationResults, errors } = CertificationResultFactory.buildAll(
          {
            certificationData,
            learnerData,
            cleaData,
            pixPlusV2VoletPixData,
            pixPlusV2VoletExterneData,
          },
          uuidGenerator,
        );

        expect(errors).to.deep.equal({
          2: '{"formErrors":[],"fieldErrors":{"results":["Invalid input: expected number, received undefined"]}}',
          4: '{"formErrors":[],"fieldErrors":{"results":["Invalid input: expected number, received undefined"]}}',
        });
        expect(certificationResults).to.deep.equal([
          new CertificationResult({
            ...certificationItemForCoreV1,
            id: '00000000-0000-4000-8000-000000000001',
            middleName: null,
            thirdName: null,
            nationalStudentId: null,
            franceCompetencesMinScore: null,
            results: {
              pixScore: certificationItemForCoreV1.pixScore,
              competenceMarks: certificationItemForCoreV1.competenceMarks,
            },
          }),
          new CertificationResult({
            ...certificationItemForCleaV2,
            id: '00000000-0000-4000-8000-000000000003',
            middleName: 'middleName_333',
            thirdName: 'thirdName_333',
            nationalStudentId: 'nationalStudentId_333',
            franceCompetencesMinScore: 120,
            results: {
              pixScore: certificationItemForCleaV2.pixScore,
              competenceMarks: certificationItemForCleaV2.competenceMarks,
              hasAcquiredClea: false,
              cleaBadgeId: 333,
            },
          }),
        ]);
        expect(userCertificationResults).to.deep.equal([
          new UserCertificationResult({
            certificationCourseId: 1,
            userId: 2,
            sessionId: 3,
            certificationResultId: '00000000-0000-4000-8000-000000000001',
            organizationLearnerId: null,
          }),
          new UserCertificationResult({
            certificationCourseId: 3,
            userId: 4,
            sessionId: 5,
            certificationResultId: '00000000-0000-4000-8000-000000000003',
            organizationLearnerId: 333,
          }),
        ]);
      });
    });

    context('when complementary data is missing', function () {
      it('returns an error for the certification instead of throwing', function () {
        // given
        const sourceData = {
          certificationData: [
            {
              ...buildCertificationData(1),
              algorithmEngineVersion: AlgorithmEngineVersion.V3,
              framework: Frameworks.CLEA,
              maxReachableLevel: 7,
              reachedMeshIndex: 4,
              pixScore: 678,
              competenceMarks: buildCompetenceMarks(1),
            },
          ],
          learnerData: [],
          cleaData: [],
          pixPlusV2VoletPixData: [],
          pixPlusV2VoletExterneData: [],
        };

        // when
        const { certificationResults, userCertificationResults, errors } = CertificationResultFactory.buildAll(
          sourceData,
          () => '00000000-0000-4000-8000-000000000001',
        );

        // then
        expect(Object.keys(errors)).to.deep.equal(['1']);
        expect(certificationResults).to.be.empty;
        expect(userCertificationResults).to.be.empty;
      });
    });
  });
});

function buildCertificationData(certificationCourseId) {
  return {
    certificationCourseId: certificationCourseId,
    userId: certificationCourseId + 1,
    sessionId: certificationCourseId + 2,
    firstName: `firstName_${certificationCourseId}`,
    lastName: `lastName_${certificationCourseId}`,
    externalId: `externalId_${certificationCourseId}`,
    birthdate: '1981-01-18',
    birthplace: `birthplace_${certificationCourseId}`,
    birthPostalCode: `birthPostalCode_${certificationCourseId}`,
    birthINSEECode: `birthINSEECode_${certificationCourseId}`,
    birthCountry: `birthCountry_${certificationCourseId}`,
    verificationCode: 'VERIFCODE',
    certificationCenter: `certificationCenter_${certificationCourseId}`,
    startedAt: new Date('2025-12-30'),
    deliveredAt: new Date('2025-12-31'),
    status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
    commentByAutoJury: `commentByAutoJury_${certificationCourseId}`,
    commentByJury: `commentByJury_${certificationCourseId}`,
    commentForOrganization: `commentForOrganization_${certificationCourseId}`,
    commentForCandidate: `commentForCandidate_${certificationCourseId}`,
  };
}

function buildCompetenceMarks(i) {
  return [
    { competenceId: `competence${i}`, level: 2 },
    { competenceId: `competence${i}${i}`, level: 7 },
  ];
}
