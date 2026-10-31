import { expect } from 'chai';

import { Certificate } from '../../../../../../src/certification/results/domain/models/Certificate.ts';
import { buildForV3 } from '../../../../../../src/certification/results/domain/models/certificate-builder.ts';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

describe('Certification | Unit | Domain | Models | certificate builder ', function () {
  describe('#buildForV3', function () {
    context('CORE', function () {
      it('builds a Certificate for CORE certification', function () {
        const certificationData = {
          id: 123,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          userId: 456,
          firstName: 'Buffy',
          lastName: 'Summers',
          birthdate: '1981-01-18',
          birthplace: 'Sunnydale',
          verificationCode: 'VERIFCODE',
          certificationCenter: 'Centre certification le meilleur',
          startedAt: new Date('2026-01-01'),
          deliveredAt: new Date('2026-01-03'),
          status: 'validated',
          versionId: 1,
          framework: Frameworks.CORE,
          maxReachableLevel: 7,
          pixScore: 678,
          reachedMeshIndex: 3,
          eduV3ExternalJuryResult: null,
          commentByAutoJury: 'commentByAutoJury',
          commentByJury: 'commentByJury',
          commentForOrganization: 'commentForOrganization',
          commentForCandidate: 'commentForCandidate',
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
        };
        const learnerData = {
          middleName: 'Ann',
          thirdName: 'Joan',
          externalId: 'xXSlayerXx',
        };
        const certificate = buildForV3(certificationData, learnerData, null);

        expect(certificate).to.deepEqualInstance(
          new Certificate({
            id: 123,
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            userId: 456,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            versionId: 1,
            framework: Frameworks.CORE,
            franceCompetencesMinScore: 120,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            results: {
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
            },
          }),
        );
      });
    });

    context('CLEA', function () {
      it('builds a Certificate for CLEA certification', function () {
        const certificationData = {
          id: 123,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          userId: 456,
          firstName: 'Buffy',
          lastName: 'Summers',
          birthdate: '1981-01-18',
          birthplace: 'Sunnydale',
          verificationCode: 'VERIFCODE',
          certificationCenter: 'Centre certification le meilleur',
          startedAt: new Date('2026-01-01'),
          deliveredAt: new Date('2026-01-03'),
          status: 'validated',
          versionId: 1,
          framework: Frameworks.CLEA,
          maxReachableLevel: 7,
          pixScore: 678,
          reachedMeshIndex: 3,
          eduV3ExternalJuryResult: null,
          commentByAutoJury: 'commentByAutoJury',
          commentByJury: 'commentByJury',
          commentForOrganization: 'commentForOrganization',
          commentForCandidate: 'commentForCandidate',
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
        };
        const learnerData = {
          middleName: 'Ann',
          thirdName: 'Joan',
          externalId: 'xXSlayerXx',
        };
        const cleaData = {
          acquired: true,
          complementaryCertificationBadgeId: 789,
        };
        const certificate = buildForV3(certificationData, learnerData, cleaData);

        expect(certificate).to.deepEqualInstance(
          new Certificate({
            id: 123,
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            userId: 456,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            versionId: 1,
            framework: Frameworks.CLEA,
            franceCompetencesMinScore: 120,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            results: {
              maxReachableLevel: 7,
              pixScore: 678,
              reachedMeshIndex: 3,
              acquired: true,
              complementaryCertificationBadgeId: 789,
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
            },
          }),
        );
      });
    });

    context('PRO_SANTE', function () {
      it('builds a Certificate for PRO_SANTE certification', function () {
        const certificationData = {
          id: 123,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          userId: 456,
          firstName: 'Buffy',
          lastName: 'Summers',
          birthdate: '1981-01-18',
          birthplace: 'Sunnydale',
          verificationCode: 'VERIFCODE',
          certificationCenter: 'Centre certification le meilleur',
          startedAt: new Date('2026-01-01'),
          deliveredAt: new Date('2026-01-03'),
          status: 'validated',
          versionId: 1,
          framework: Frameworks.PRO_SANTE,
          maxReachableLevel: null,
          pixScore: null,
          reachedMeshIndex: 3,
          eduV3ExternalJuryResult: null,
          commentByAutoJury: 'commentByAutoJury',
          commentByJury: 'commentByJury',
          commentForOrganization: 'commentForOrganization',
          commentForCandidate: 'commentForCandidate',
          competenceMarks: [],
        };
        const learnerData = {
          middleName: 'Ann',
          thirdName: 'Joan',
          externalId: 'xXSlayerXx',
        };
        const certificate = buildForV3(certificationData, learnerData, null);

        expect(certificate).to.deepEqualInstance(
          new Certificate({
            id: 123,
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            userId: 456,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            versionId: 1,
            framework: Frameworks.PRO_SANTE,
            franceCompetencesMinScore: null,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            results: {
              reachedMeshIndex: 3,
            },
          }),
        );
      });
    });

    context('DROIT', function () {
      it('builds a Certificate for DROIT certification', function () {
        const certificationData = {
          id: 123,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          userId: 456,
          firstName: 'Buffy',
          lastName: 'Summers',
          birthdate: '1981-01-18',
          birthplace: 'Sunnydale',
          verificationCode: 'VERIFCODE',
          certificationCenter: 'Centre certification le meilleur',
          startedAt: new Date('2026-01-01'),
          deliveredAt: new Date('2026-01-03'),
          status: 'validated',
          versionId: 1,
          framework: Frameworks.DROIT,
          maxReachableLevel: null,
          pixScore: null,
          reachedMeshIndex: 3,
          eduV3ExternalJuryResult: null,
          commentByAutoJury: 'commentByAutoJury',
          commentByJury: 'commentByJury',
          commentForOrganization: 'commentForOrganization',
          commentForCandidate: 'commentForCandidate',
          competenceMarks: [],
        };
        const learnerData = {
          middleName: 'Ann',
          thirdName: 'Joan',
          externalId: 'xXSlayerXx',
        };
        const certificate = buildForV3(certificationData, learnerData, null);

        expect(certificate).to.deepEqualInstance(
          new Certificate({
            id: 123,
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            userId: 456,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            versionId: 1,
            framework: Frameworks.DROIT,
            franceCompetencesMinScore: null,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            results: {
              reachedMeshIndex: 3,
            },
          }),
        );
      });
    });

    context('EDU_CPE', function () {
      it('builds a Certificate for EDU_CPE certification', function () {
        const certificationData = {
          id: 123,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          userId: 456,
          firstName: 'Buffy',
          lastName: 'Summers',
          birthdate: '1981-01-18',
          birthplace: 'Sunnydale',
          verificationCode: 'VERIFCODE',
          certificationCenter: 'Centre certification le meilleur',
          startedAt: new Date('2026-01-01'),
          deliveredAt: new Date('2026-01-03'),
          status: 'validated',
          versionId: 1,
          framework: Frameworks.EDU_CPE,
          maxReachableLevel: null,
          pixScore: null,
          reachedMeshIndex: 3,
          eduV3ExternalJuryResult: 'super mec',
          commentByAutoJury: 'commentByAutoJury',
          commentByJury: 'commentByJury',
          commentForOrganization: 'commentForOrganization',
          commentForCandidate: 'commentForCandidate',
          competenceMarks: [],
        };
        const learnerData = {
          middleName: 'Ann',
          thirdName: 'Joan',
          externalId: 'xXSlayerXx',
        };
        const certificate = buildForV3(certificationData, learnerData, null);

        expect(certificate).to.deepEqualInstance(
          new Certificate({
            id: 123,
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            userId: 456,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            versionId: 1,
            framework: Frameworks.EDU_CPE,
            franceCompetencesMinScore: null,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            results: {
              reachedMeshIndex: 3,
              eduV3ExternalJuryResult: 'super mec',
            },
          }),
        );
      });
    });

    context('EDU_1ER_DEGRE', function () {
      it('builds a Certificate for EDU_CPE certification', function () {
        const certificationData = {
          id: 123,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          userId: 456,
          firstName: 'Buffy',
          lastName: 'Summers',
          birthdate: '1981-01-18',
          birthplace: 'Sunnydale',
          verificationCode: 'VERIFCODE',
          certificationCenter: 'Centre certification le meilleur',
          startedAt: new Date('2026-01-01'),
          deliveredAt: new Date('2026-01-03'),
          status: 'validated',
          versionId: 1,
          framework: Frameworks.EDU_1ER_DEGRE,
          maxReachableLevel: null,
          pixScore: null,
          reachedMeshIndex: 3,
          eduV3ExternalJuryResult: 'super mec',
          competenceMarks: [],
        };
        const learnerData = {
          middleName: 'Ann',
          thirdName: 'Joan',
          externalId: 'xXSlayerXx',
        };
        const certificate = buildForV3(certificationData, learnerData, null);

        expect(certificate).to.deepEqualInstance(
          new Certificate({
            id: 123,
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            userId: 456,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            versionId: 1,
            framework: Frameworks.EDU_1ER_DEGRE,
            franceCompetencesMinScore: null,
            results: {
              reachedMeshIndex: 3,
              eduV3ExternalJuryResult: 'super mec',
            },
          }),
        );
      });
    });

    context('EDU_2ND_DEGRE', function () {
      it('builds a Certificate for EDU_2ND_DEGRE certification', function () {
        const certificationData = {
          id: 123,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          userId: 456,
          firstName: 'Buffy',
          lastName: 'Summers',
          birthdate: '1981-01-18',
          birthplace: 'Sunnydale',
          verificationCode: 'VERIFCODE',
          certificationCenter: 'Centre certification le meilleur',
          startedAt: new Date('2026-01-01'),
          deliveredAt: new Date('2026-01-03'),
          status: 'validated',
          versionId: 1,
          framework: Frameworks.EDU_2ND_DEGRE,
          maxReachableLevel: null,
          pixScore: null,
          reachedMeshIndex: 3,
          eduV3ExternalJuryResult: 'super mec',
          commentByAutoJury: 'commentByAutoJury',
          commentByJury: 'commentByJury',
          commentForOrganization: 'commentForOrganization',
          commentForCandidate: 'commentForCandidate',
          competenceMarks: [],
        };
        const learnerData = {
          middleName: 'Ann',
          thirdName: 'Joan',
          externalId: 'xXSlayerXx',
        };
        const certificate = buildForV3(certificationData, learnerData, null);

        expect(certificate).to.deepEqualInstance(
          new Certificate({
            id: 123,
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            userId: 456,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            versionId: 1,
            framework: Frameworks.EDU_2ND_DEGRE,
            franceCompetencesMinScore: null,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            results: {
              reachedMeshIndex: 3,
              eduV3ExternalJuryResult: 'super mec',
            },
          }),
        );
      });
    });

    context('when certification was delivered prior to FRANCE_COMPETENCES_PROFESSIONAL_START_DATE', function () {
      it('builds a certificate with no minimum score for france competences', function () {
        const certificationData = {
          id: 123,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          userId: 456,
          firstName: 'Buffy',
          lastName: 'Summers',
          birthdate: '1981-01-18',
          birthplace: 'Sunnydale',
          verificationCode: 'VERIFCODE',
          certificationCenter: 'Centre certification le meilleur',
          startedAt: new Date('2021-12-30'),
          deliveredAt: new Date('2021-12-31'),
          status: 'validated',
          versionId: 1,
          framework: Frameworks.CORE,
          maxReachableLevel: 7,
          pixScore: 678,
          reachedMeshIndex: 3,
          eduV3ExternalJuryResult: null,
          commentByAutoJury: 'commentByAutoJury',
          commentByJury: 'commentByJury',
          commentForOrganization: 'commentForOrganization',
          commentForCandidate: 'commentForCandidate',
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
        };
        const learnerData = {
          middleName: 'Ann',
          thirdName: 'Joan',
          externalId: 'xXSlayerXx',
        };
        const certificate = buildForV3(certificationData, learnerData, null);

        expect(certificate).to.deepEqualInstance(
          new Certificate({
            id: 123,
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            userId: 456,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2021-12-30'),
            deliveredAt: new Date('2021-12-31'),
            status: 'validated',
            versionId: 1,
            framework: Frameworks.CORE,
            franceCompetencesMinScore: null,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            results: {
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
            },
          }),
        );
      });
    });

    context('when no learner data provided in the builder', function () {
      it('builds a certificate with no additional info on candidate identity (middle/third names and external ID)', function () {
        const certificationData = {
          id: 123,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          userId: 456,
          firstName: 'Buffy',
          lastName: 'Summers',
          birthdate: '1981-01-18',
          birthplace: 'Sunnydale',
          verificationCode: 'VERIFCODE',
          certificationCenter: 'Centre certification le meilleur',
          startedAt: new Date('2025-12-30'),
          deliveredAt: new Date('2025-12-31'),
          status: 'validated',
          versionId: 1,
          framework: Frameworks.CORE,
          maxReachableLevel: 7,
          pixScore: 678,
          reachedMeshIndex: 3,
          eduV3ExternalJuryResult: null,
          commentByAutoJury: 'commentByAutoJury',
          commentByJury: 'commentByJury',
          commentForOrganization: 'commentForOrganization',
          commentForCandidate: 'commentForCandidate',
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
        };
        const certificate = buildForV3(certificationData, null, null);

        expect(certificate).to.deepEqualInstance(
          new Certificate({
            id: 123,
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            userId: 456,
            firstName: 'Buffy',
            middleName: null,
            thirdName: null,
            lastName: 'Summers',
            externalId: null,
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2025-12-30'),
            deliveredAt: new Date('2025-12-31'),
            status: 'validated',
            versionId: 1,
            framework: Frameworks.CORE,
            franceCompetencesMinScore: 120,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            results: {
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
            },
          }),
        );
      });
    });
  });
});
