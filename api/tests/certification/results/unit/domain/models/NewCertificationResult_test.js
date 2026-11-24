import { expect } from 'chai';

import { CertificationResult } from '../../../../../../src/certification/results/domain/models/NewCertificationResult.ts';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

describe('Certification | Result | Unit | Domain | Models | NewCertificationResult', function () {
  context('#constructor', function () {
    context('V3', function () {
      let baseProps;

      beforeEach(function () {
        baseProps = {
          id: '7c56d60d-27e7-410b-9228-0e81192fb7ec',
          firstName: 'Buffy',
          middleName: null,
          thirdName: null,
          lastName: 'Summers',
          externalId: null,
          nationalStudentId: 'some student id',
          birthdate: '1981-01-18',
          birthplace: 'Sunnydale',
          birthPostalCode: null,
          birthINSEECode: '99001',
          birthCountry: 'États-Unis',
          verificationCode: 'VERIFCODE',
          certificationCenter: 'Centre certification le meilleur',
          startedAt: new Date('2025-12-30'),
          deliveredAt: new Date('2025-12-31'),
          status: 'validated',
          commentByAutoJury: 'commentByAutoJury',
          commentByJury: 'commentByJury',
          commentForOrganization: 'commentForOrganization',
          commentForCandidate: 'commentForCandidate',
        };
      });

      it('should return null for a valid CORE certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          framework: Frameworks.CORE,
          franceCompetencesMinScore: 120,
          results: {
            pixScore: 512,
            competenceMarks: [{ competenceId: 'recCompetence', level: 4 }],
            maxReachableLevel: 7,
            reachedMeshIndex: 5,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return null for a valid CLEA certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          framework: Frameworks.CLEA,
          franceCompetencesMinScore: null,
          results: {
            pixScore: 512,
            competenceMarks: [{ competenceId: 'recCompetence', level: 4 }],
            maxReachableLevel: 7,
            reachedMeshIndex: 5,
            hasAcquiredClea: true,
            cleaBadgeId: 1,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return null for a valid DROIT certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          framework: Frameworks.DROIT,
          franceCompetencesMinScore: null,
          results: {
            maxReachableLevel: 3,
            reachedMeshIndex: null,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return null for a valid PRO_SANTE certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          framework: Frameworks.PRO_SANTE,
          franceCompetencesMinScore: null,
          results: {
            maxReachableLevel: 3,
            reachedMeshIndex: null,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return null for a valid EDU_1ER_DEGRE certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          framework: Frameworks.EDU_1ER_DEGRE,
          franceCompetencesMinScore: null,
          results: {
            maxReachableLevel: 3,
            reachedMeshIndex: 2,
            v3EduExternalJuryResult: null,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return null for a valid EDU_2ND_DEGRE certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          framework: Frameworks.EDU_2ND_DEGRE,
          franceCompetencesMinScore: null,
          results: {
            maxReachableLevel: 3,
            reachedMeshIndex: 2,
            v3EduExternalJuryResult: null,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return null for a valid EDU_CPE certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          framework: Frameworks.EDU_CPE,
          franceCompetencesMinScore: null,
          results: {
            maxReachableLevel: 3,
            reachedMeshIndex: 2,
            v3EduExternalJuryResult: null,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return an error when franceCompetencesMinScore is not null for a DROIT certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          framework: Frameworks.DROIT,
          franceCompetencesMinScore: 123,
          results: {
            maxReachableLevel: 3,
            reachedMeshIndex: null,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.equal(
          '{"formErrors":[],"fieldErrors":{"franceCompetencesMinScore":["Invalid input: expected null, received number"]}}',
        );
      });
    });

    context('V2', function () {
      let baseProps;

      beforeEach(function () {
        baseProps = {
          id: '7c56d60d-27e7-410b-9228-0e81192fb7ec',
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
          firstName: 'Buffy',
          middleName: null,
          thirdName: null,
          lastName: 'Summers',
          externalId: null,
          nationalStudentId: 'some student id',
          birthdate: '1981-01-18',
          birthplace: 'Sunnydale',
          birthPostalCode: null,
          birthINSEECode: '99001',
          birthCountry: 'États-Unis',
          verificationCode: 'VERIFCODE',
          certificationCenter: 'Centre certification le meilleur',
          startedAt: new Date('2022-12-30'),
          deliveredAt: new Date('2022-12-31'),
          status: 'validated',
          franceCompetencesMinScore: null,
          commentByAutoJury: 'commentByAutoJury',
          commentByJury: 'commentByJury',
          commentForOrganization: 'commentForOrganization',
          commentForCandidate: 'commentForCandidate',
        };
      });

      it('should return null for a valid CORE certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          framework: Frameworks.CORE,
          franceCompetencesMinScore: 120,
          results: {
            pixScore: 512,
            competenceMarks: [{ competenceId: 'recCompetence', level: 4 }],
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return null for a valid CLEA certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          framework: Frameworks.CLEA,
          results: {
            pixScore: 512,
            competenceMarks: [{ competenceId: 'recCompetence', level: 4 }],
            hasAcquiredClea: false,
            cleaBadgeId: 1,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return null for a valid DROIT certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          framework: Frameworks.DROIT,
          results: {
            pixScore: 123,
            competenceMarks: [{ competenceId: 'competenceABC123', level: 1 }],
            v2ComplementaryVoletPixBadgeId: 2,
            v2ComplementaryVoletPixAcquired: true,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return null for a valid PRO_SANTE certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          framework: Frameworks.PRO_SANTE,
          results: {
            pixScore: 123,
            competenceMarks: [{ competenceId: 'competenceABC123', level: 1 }],
            v2ComplementaryVoletPixBadgeId: 2,
            v2ComplementaryVoletPixAcquired: true,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return null for a valid EDU_1ER_DEGRE certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          framework: Frameworks.EDU_1ER_DEGRE,
          results: {
            pixScore: 123,
            competenceMarks: [{ competenceId: 'competenceABC123', level: 1 }],
            v2ComplementaryVoletPixBadgeId: 2,
            v2ComplementaryVoletPixAcquired: true,
            v2EduVoletExterneBadgeId: 3,
            v2EduVoletExterneAcquired: false,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return null for a valid EDU_2ND_DEGRE certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          framework: Frameworks.EDU_2ND_DEGRE,
          results: {
            pixScore: 123,
            competenceMarks: [{ competenceId: 'competenceABC123', level: 1 }],
            v2ComplementaryVoletPixBadgeId: 2,
            v2ComplementaryVoletPixAcquired: true,
            v2EduVoletExterneBadgeId: 3,
            v2EduVoletExterneAcquired: false,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return null for a valid EDU_CPE certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          framework: Frameworks.EDU_CPE,
          results: {
            pixScore: 123,
            competenceMarks: [{ competenceId: 'competenceABC123', level: 1 }],
            v2ComplementaryVoletPixBadgeId: 2,
            v2ComplementaryVoletPixAcquired: true,
            v2EduVoletExterneBadgeId: 3,
            v2EduVoletExterneAcquired: false,
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });
    });

    context('V1', function () {
      let baseProps;

      beforeEach(function () {
        baseProps = {
          id: '7c56d60d-27e7-410b-9228-0e81192fb7ec',
          firstName: 'Buffy',
          middleName: null,
          thirdName: null,
          lastName: 'Summers',
          externalId: null,
          nationalStudentId: null,
          birthdate: '1981-01-18',
          birthplace: 'Sunnydale',
          birthPostalCode: null,
          birthINSEECode: null,
          birthCountry: null,
          verificationCode: 'VERIFCODE',
          certificationCenter: 'Centre certification le meilleur',
          startedAt: new Date('2025-12-30'),
          deliveredAt: new Date('2025-12-31'),
          status: 'validated',
          commentByAutoJury: null,
          commentByJury: null,
          commentForOrganization: null,
          commentForCandidate: null,
          franceCompetencesMinScore: null,
        };
      });

      it('should return null for a valid CORE certification', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          algorithmEngineVersion: AlgorithmEngineVersion.V1,
          framework: Frameworks.CORE,
          results: {
            pixScore: 256,
            competenceMarks: [{ competenceId: 'recCompetence', level: 3 }],
          },
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.be.null;
      });

      it('should return an error when framework is not CORE', function () {
        // given
        const certifResult = new CertificationResult({
          ...baseProps,
          algorithmEngineVersion: AlgorithmEngineVersion.V1,
          framework: Frameworks.DROIT,
        });

        // when
        const errString = certifResult.validate();

        // then
        expect(errString).to.equal(
          '{"formErrors":[],"fieldErrors":{"framework":["Invalid input: expected \\"CORE\\""],"results":["Invalid input: expected object, received undefined"]}}',
        );
      });
    });
  });
});
