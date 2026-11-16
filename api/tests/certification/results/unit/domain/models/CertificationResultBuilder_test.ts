import type { UUID } from 'node:crypto';

import { expect } from 'chai';

import {
  type CertificationDataV3Props,
  CertificationResultBuilder,
} from '../../../../../../src/certification/results/domain/models/CertificationResultBuilder.ts';
import {
  CertificationResult,
  UserCertificationResult,
} from '../../../../../../src/certification/results/domain/models/NewCertificationResult.ts';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

describe('Certification | Unit | Domain | Models | CertificationResultBuilder', function () {
  describe('#build', function () {
    const uuidGenerator = (): UUID => '00000000-0000-4000-8000-000000000001';
    context('when algorithm version not handled yet', function () {
      it('returns an errors Map with certification course ids in error', function () {
        const builder = new CertificationResultBuilder({
          certificationData: [
            {
              certificationCourseId: 123,
              algorithmEngineVersion: AlgorithmEngineVersion.V1,
            } as CertificationDataV3Props,
            {
              certificationCourseId: 456,
              algorithmEngineVersion: AlgorithmEngineVersion.V2,
            } as CertificationDataV3Props,
          ],
          learnerData: [],
          cleaData: [],
        });

        const { certificationResults, userCertificationResults, errors } = builder.build(uuidGenerator);
        expect(certificationResults).to.have.length(0);
        expect(userCertificationResults).to.have.length(0);
        expect(errors).to.deep.equal({
          123: 'AlgorithmEngineVersion 1 not implemented yet.',
          456: 'AlgorithmEngineVersion 2 not implemented yet.',
        });
      });
    });

    context('CORE', function () {
      it('builds a certificationResult and a userCertificationResult for CORE certification', function () {
        const certificationData: CertificationDataV3Props[] = [
          {
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            organizationLearnerId: 555,
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
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
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
          },
        ];
        const learnerData = [
          {
            organizationLearnerId: 555,
            middleName: 'Ann',
            thirdName: 'Joan',
            nationalStudentId: 'xXSlayerXx',
          },
        ];

        const builder = new CertificationResultBuilder({ certificationData, learnerData, cleaData: [] });
        const { certificationResults, userCertificationResults, errors } = builder.build(uuidGenerator);

        expect(certificationResults).to.deep.equal([
          new CertificationResult({
            id: '00000000-0000-4000-8000-000000000001',
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'the_slayer',
            nationalStudentId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            birthPostalCode: 'SomePostalCode',
            birthINSEECode: 'SomeINSEECode',
            birthCountry: 'USA',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
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
        ]);
        expect(userCertificationResults).to.deep.equal([
          new UserCertificationResult({
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            certificationResultId: '00000000-0000-4000-8000-000000000001',
          }),
        ]);
        expect(errors).to.deep.equal({});
      });
    });

    context('CLEA', function () {
      it('builds a certificationResult and a userCertificationResult for CLEA certification', function () {
        const certificationData: CertificationDataV3Props[] = [
          {
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            organizationLearnerId: 555,
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            firstName: 'Buffy',
            lastName: 'Summers',
            externalId: 'the_slayer',
            birthPostalCode: 'SomePostalCode',
            birthINSEECode: 'SomeINSEECode',
            birthCountry: 'USA',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
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
          },
        ];
        const learnerData = [
          {
            organizationLearnerId: 555,
            middleName: 'Ann',
            thirdName: 'Joan',
            nationalStudentId: 'xXSlayerXx',
          },
        ];
        const cleaData = [
          {
            certificationCourseId: 123,
            acquired: true,
            complementaryCertificationBadgeId: 789,
          },
        ];

        const builder = new CertificationResultBuilder({ certificationData, learnerData, cleaData });
        const { certificationResults, userCertificationResults, errors } = builder.build(uuidGenerator);

        expect(certificationResults).to.deep.equal([
          new CertificationResult({
            id: '00000000-0000-4000-8000-000000000001',
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'the_slayer',
            nationalStudentId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            birthPostalCode: 'SomePostalCode',
            birthINSEECode: 'SomeINSEECode',
            birthCountry: 'USA',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
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
              hasAcquiredClea: true,
              cleaBadgeId: 789,
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
        ]);
        expect(userCertificationResults).to.deep.equal([
          new UserCertificationResult({
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            certificationResultId: '00000000-0000-4000-8000-000000000001',
          }),
        ]);
        expect(errors).to.deep.equal({});
      });
    });

    context('PRO_SANTE', function () {
      it('builds a certificationResult and a userCertificationResult for PRO_SANTE certification', function () {
        const certificationData: CertificationDataV3Props[] = [
          {
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            organizationLearnerId: 555,
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
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            framework: Frameworks.PRO_SANTE,
            maxReachableLevel: 1,
            pixScore: null,
            reachedMeshIndex: 3,
            eduV3ExternalJuryResult: null,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            competenceMarks: [],
          },
        ];
        const learnerData = [
          {
            organizationLearnerId: 555,
            middleName: 'Ann',
            thirdName: 'Joan',
            nationalStudentId: 'xXSlayerXx',
          },
        ];

        const builder = new CertificationResultBuilder({ certificationData, learnerData, cleaData: [] });
        const { certificationResults, userCertificationResults, errors } = builder.build(uuidGenerator);

        expect(certificationResults).to.deep.equal([
          new CertificationResult({
            id: '00000000-0000-4000-8000-000000000001',
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'the_slayer',
            nationalStudentId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            birthPostalCode: 'SomePostalCode',
            birthINSEECode: 'SomeINSEECode',
            birthCountry: 'USA',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            framework: Frameworks.PRO_SANTE,
            franceCompetencesMinScore: null,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            results: {
              reachedMeshIndex: 3,
              maxReachableLevel: 1,
            },
          }),
        ]);
        expect(userCertificationResults).to.deep.equal([
          new UserCertificationResult({
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            certificationResultId: '00000000-0000-4000-8000-000000000001',
          }),
        ]);
        expect(errors).to.deep.equal({});
      });
    });

    context('DROIT', function () {
      it('builds a certificationResult and a userCertificationResult for DROIT certification', function () {
        const certificationData: CertificationDataV3Props[] = [
          {
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            organizationLearnerId: 555,
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
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            framework: Frameworks.DROIT,
            maxReachableLevel: 1,
            pixScore: null,
            reachedMeshIndex: 3,
            eduV3ExternalJuryResult: null,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            competenceMarks: [],
          },
        ];
        const learnerData = [
          {
            organizationLearnerId: 555,
            middleName: 'Ann',
            thirdName: 'Joan',
            nationalStudentId: 'xXSlayerXx',
          },
        ];

        const builder = new CertificationResultBuilder({ certificationData, learnerData, cleaData: [] });
        const { certificationResults, userCertificationResults, errors } = builder.build(uuidGenerator);

        expect(certificationResults).to.deep.equal([
          new CertificationResult({
            id: '00000000-0000-4000-8000-000000000001',
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'the_slayer',
            nationalStudentId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            birthPostalCode: 'SomePostalCode',
            birthINSEECode: 'SomeINSEECode',
            birthCountry: 'USA',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            framework: Frameworks.DROIT,
            franceCompetencesMinScore: null,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            results: {
              maxReachableLevel: 1,
              reachedMeshIndex: 3,
            },
          }),
        ]);
        expect(userCertificationResults).to.deep.equal([
          new UserCertificationResult({
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            certificationResultId: '00000000-0000-4000-8000-000000000001',
          }),
        ]);
        expect(errors).to.deep.equal({});
      });
    });

    context('EDU_CPE', function () {
      it('builds a certificationResult and a userCertificationResult for EDU_CPE certification', function () {
        const certificationData: CertificationDataV3Props[] = [
          {
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            organizationLearnerId: 555,
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
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            framework: Frameworks.EDU_CPE,
            maxReachableLevel: 1,
            pixScore: null,
            reachedMeshIndex: 3,
            eduV3ExternalJuryResult: 'super mec',
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            competenceMarks: [],
          },
        ];
        const learnerData = [
          {
            organizationLearnerId: 555,
            middleName: 'Ann',
            thirdName: 'Joan',
            nationalStudentId: 'xXSlayerXx',
          },
        ];

        const builder = new CertificationResultBuilder({ certificationData, learnerData, cleaData: [] });
        const { certificationResults, userCertificationResults, errors } = builder.build(uuidGenerator);

        expect(certificationResults).to.deep.equal([
          new CertificationResult({
            id: '00000000-0000-4000-8000-000000000001',
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'the_slayer',
            nationalStudentId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            birthPostalCode: 'SomePostalCode',
            birthINSEECode: 'SomeINSEECode',
            birthCountry: 'USA',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            framework: Frameworks.EDU_CPE,
            franceCompetencesMinScore: null,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            results: {
              maxReachableLevel: 1,
              reachedMeshIndex: 3,
              eduV3ExternalJuryResult: 'super mec',
            },
          }),
        ]);
        expect(userCertificationResults).to.deep.equal([
          new UserCertificationResult({
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            certificationResultId: '00000000-0000-4000-8000-000000000001',
          }),
        ]);
        expect(errors).to.deep.equal({});
      });
    });

    context('EDU_1ER_DEGRE', function () {
      it('builds a certificationResult and a userCertificationResult for EDU_CPE certification', function () {
        const certificationData: CertificationDataV3Props[] = [
          {
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            organizationLearnerId: 555,
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
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            framework: Frameworks.EDU_1ER_DEGRE,
            maxReachableLevel: 1,
            pixScore: null,
            reachedMeshIndex: 3,
            eduV3ExternalJuryResult: 'super mec',
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            competenceMarks: [],
          },
        ];
        const learnerData = [
          {
            organizationLearnerId: 555,
            middleName: 'Ann',
            thirdName: 'Joan',
            nationalStudentId: 'xXSlayerXx',
          },
        ];

        const builder = new CertificationResultBuilder({ certificationData, learnerData, cleaData: [] });
        const { certificationResults, userCertificationResults, errors } = builder.build(uuidGenerator);

        expect(certificationResults).to.deep.equal([
          new CertificationResult({
            id: '00000000-0000-4000-8000-000000000001',
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'the_slayer',
            nationalStudentId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            birthPostalCode: 'SomePostalCode',
            birthINSEECode: 'SomeINSEECode',
            birthCountry: 'USA',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            framework: Frameworks.EDU_1ER_DEGRE,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            franceCompetencesMinScore: null,
            results: {
              maxReachableLevel: 1,
              reachedMeshIndex: 3,
              eduV3ExternalJuryResult: 'super mec',
            },
          }),
        ]);
        expect(userCertificationResults).to.deep.equal([
          new UserCertificationResult({
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            certificationResultId: '00000000-0000-4000-8000-000000000001',
          }),
        ]);
        expect(errors).to.deep.equal({});
      });
    });

    context('EDU_2ND_DEGRE', function () {
      it('builds a certificationResult and a userCertificationResult for EDU_2ND_DEGRE certification', function () {
        const certificationData: CertificationDataV3Props[] = [
          {
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            organizationLearnerId: 555,
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
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            framework: Frameworks.EDU_2ND_DEGRE,
            maxReachableLevel: 1,
            pixScore: null,
            reachedMeshIndex: 3,
            eduV3ExternalJuryResult: 'super mec',
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            competenceMarks: [],
          },
        ];
        const learnerData = [
          {
            organizationLearnerId: 555,
            middleName: 'Ann',
            thirdName: 'Joan',
            nationalStudentId: 'xXSlayerXx',
          },
        ];

        const builder = new CertificationResultBuilder({ certificationData, learnerData, cleaData: [] });
        const { certificationResults, userCertificationResults, errors } = builder.build(uuidGenerator);

        expect(certificationResults).to.deep.equal([
          new CertificationResult({
            id: '00000000-0000-4000-8000-000000000001',
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'the_slayer',
            nationalStudentId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            birthPostalCode: 'SomePostalCode',
            birthINSEECode: 'SomeINSEECode',
            birthCountry: 'USA',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2026-01-01'),
            deliveredAt: new Date('2026-01-03'),
            status: 'validated',
            framework: Frameworks.EDU_2ND_DEGRE,
            franceCompetencesMinScore: null,
            commentByAutoJury: 'commentByAutoJury',
            commentByJury: 'commentByJury',
            commentForOrganization: 'commentForOrganization',
            commentForCandidate: 'commentForCandidate',
            results: {
              maxReachableLevel: 1,
              reachedMeshIndex: 3,
              eduV3ExternalJuryResult: 'super mec',
            },
          }),
        ]);
        expect(userCertificationResults).to.deep.equal([
          new UserCertificationResult({
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            certificationResultId: '00000000-0000-4000-8000-000000000001',
          }),
        ]);
        expect(errors).to.deep.equal({});
      });
    });

    context('when certification was delivered prior to FRANCE_COMPETENCES_PROFESSIONAL_START_DATE', function () {
      it('builds a certificationResult and a userCertificationResult with no minimum score for france competences', function () {
        const certificationData: CertificationDataV3Props[] = [
          {
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            organizationLearnerId: 555,
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
            startedAt: new Date('2021-12-30'),
            deliveredAt: new Date('2021-12-31'),
            status: 'validated',
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
          },
        ];
        const learnerData = [
          {
            organizationLearnerId: 555,
            middleName: 'Ann',
            thirdName: 'Joan',
            nationalStudentId: 'xXSlayerXx',
          },
        ];

        const builder = new CertificationResultBuilder({ certificationData, learnerData, cleaData: [] });
        const { certificationResults, userCertificationResults, errors } = builder.build(uuidGenerator);

        expect(certificationResults).to.deep.equal([
          new CertificationResult({
            id: '00000000-0000-4000-8000-000000000001',
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            firstName: 'Buffy',
            middleName: 'Ann',
            thirdName: 'Joan',
            lastName: 'Summers',
            externalId: 'the_slayer',
            nationalStudentId: 'xXSlayerXx',
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            birthPostalCode: 'SomePostalCode',
            birthINSEECode: 'SomeINSEECode',
            birthCountry: 'USA',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2021-12-30'),
            deliveredAt: new Date('2021-12-31'),
            status: 'validated',
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
        ]);
        expect(userCertificationResults).to.deep.equal([
          new UserCertificationResult({
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            certificationResultId: '00000000-0000-4000-8000-000000000001',
          }),
        ]);
        expect(errors).to.deep.equal({});
      });
    });

    context('when no learner matches the organization learner of the certification', function () {
      it('builds a certificationResult and a userCertificationResult with no additional info on candidate identity (middle/third names and external ID)', function () {
        const certificationData: CertificationDataV3Props[] = [
          {
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            organizationLearnerId: 555,
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
            status: 'validated',
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

        const builder = new CertificationResultBuilder({ certificationData, learnerData, cleaData: [] });
        const { certificationResults, userCertificationResults, errors } = builder.build(uuidGenerator);

        expect(certificationResults).to.deep.equal([
          new CertificationResult({
            id: '00000000-0000-4000-8000-000000000001',
            algorithmEngineVersion: AlgorithmEngineVersion.V3,
            firstName: 'Buffy',
            middleName: null,
            thirdName: null,
            lastName: 'Summers',
            externalId: 'the_slayer',
            nationalStudentId: null,
            birthdate: '1981-01-18',
            birthplace: 'Sunnydale',
            birthPostalCode: 'SomePostalCode',
            birthINSEECode: 'SomeINSEECode',
            birthCountry: 'USA',
            verificationCode: 'VERIFCODE',
            certificationCenter: 'Centre certification le meilleur',
            startedAt: new Date('2025-12-30'),
            deliveredAt: new Date('2025-12-31'),
            status: 'validated',
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
        ]);
        expect(userCertificationResults).to.deep.equal([
          new UserCertificationResult({
            certificationCourseId: 123,
            userId: 456,
            sessionId: 777,
            certificationResultId: '00000000-0000-4000-8000-000000000001',
          }),
        ]);
        expect(errors).to.deep.equal({});
      });
    });
  });
});
