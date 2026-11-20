import { expect } from 'chai';

import {
  CertificationResultV2Schema,
  V2CleaResultsSchema,
  V2EduResultsSchema,
  V2PixPlusResultsSchema,
} from '../../../../../../../src/certification/results/domain/models/validators/V2CertificationResult.ts';
import { AlgorithmEngineVersion } from '../../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';

describe('Certification | Results | Unit | Domain | Models | Validators | V2CertificationResult', function () {
  const coreResults = {
    pixScore: 512,
    competenceMarks: [{ competenceId: 'recCompetence', level: 4 }],
  };
  const cleaResults = { ...coreResults, hasAcquiredClea: true, cleaBadgeId: 1 };
  const pixPlusResults = { ...coreResults, v2VoletPixBadgeId: 2, v2VoletPixAcquired: true };
  const eduResults = { ...pixPlusResults, v2VoletExterneBadgeId: 3, v2VoletExterneAcquired: false };

  describe('V2CleaResultsSchema', function () {
    it('should accept valid clea results', function () {
      // when
      const result = V2CleaResultsSchema.safeParse(cleaResults);

      // then
      expect(result.success).to.equal(true);
    });

    it('should reject clea results without core results', function () {
      // when
      const result = V2CleaResultsSchema.safeParse({ hasAcquiredClea: true, cleaBadgeId: 1 });

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject core results without clea results', function () {
      // when
      const result = V2CleaResultsSchema.safeParse(coreResults);

      // then
      expect(result.success).to.equal(false);
    });
  });

  describe('V2PixPlusResultsSchema', function () {
    it('should accept valid pix plus results', function () {
      // when
      const result = V2PixPlusResultsSchema.safeParse(pixPlusResults);

      // then
      expect(result.success).to.equal(true);
    });

    it('should reject a missing v2VoletPixAcquired', function () {
      // when
      const result = V2PixPlusResultsSchema.safeParse({ v2VoletPixBadgeId: 2 });

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject a missing v2VoletPixBadgeId', function () {
      // when
      const result = V2PixPlusResultsSchema.safeParse({ v2VoletPixAcquired: true });

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject without core results', function () {
      // when
      const result = V2CleaResultsSchema.safeParse({ v2VoletPixAcquired: true, v2VoletPixBadgeId: 123 });

      // then
      expect(result.success).to.equal(false);
    });
  });

  describe('V2EduResultsSchema', function () {
    it('should accept valid edu results', function () {
      // when
      const result = V2EduResultsSchema.safeParse(eduResults);

      // then
      expect(result.success).to.equal(true);
    });

    it('should reject edu results without volet externe', function () {
      // when
      const result = V2EduResultsSchema.safeParse(pixPlusResults);

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject a missing v2VoletExterneAcquired', function () {
      // when
      const result = V2EduResultsSchema.safeParse({ ...eduResults, v2VoletExterneAcquired: undefined });

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject a missing v2VoletExterneBadgeId', function () {
      // when
      const result = V2EduResultsSchema.safeParse({ ...eduResults, v2VoletExterneBadgeId: undefined });

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject without core results', function () {
      // when
      const result = V2CleaResultsSchema.safeParse({
        v2VoletPixAcquired: true,
        v2VoletPixBadgeId: 123,
        v2VoletExterneAcquired: true,
        v2VoletExterneBadgeId: 123,
      });

      // then
      expect(result.success).to.equal(false);
    });
  });

  describe('CertificationResultV2Schema', function () {
    let baseData: Record<string, unknown>;

    beforeEach(function () {
      baseData = {
        id: '7c56d60d-27e7-410b-9228-0e81192fb7ec',
        algorithmEngineVersion: AlgorithmEngineVersion.V2,
        firstName: 'Buffy',
        middleName: 'Anne',
        thirdName: null,
        lastName: 'Summers',
        externalId: null,
        nationalStudentId: '123456789AB',
        birthdate: '1981-01-18',
        birthplace: 'Sunnydale',
        birthPostalCode: '75001',
        birthINSEECode: '75101',
        birthCountry: 'FRANCE',
        verificationCode: 'VERIFCODE',
        certificationCenter: 'Centre de certification',
        startedAt: new Date('2022-12-30'),
        deliveredAt: new Date('2022-12-31'),
        status: 'validated',
        franceCompetencesMinScore: 120,
        commentByAutoJury: 'commentByAutoJury',
        commentByJury: null,
        commentForOrganization: null,
        commentForCandidate: null,
      };
    });

    [
      { framework: Frameworks.CORE, results: coreResults },
      { framework: Frameworks.CLEA, results: cleaResults },
      { framework: Frameworks.DROIT, results: pixPlusResults },
      { framework: Frameworks.PRO_SANTE, results: pixPlusResults },
      { framework: Frameworks.EDU_1ER_DEGRE, results: eduResults },
      { framework: Frameworks.EDU_2ND_DEGRE, results: eduResults },
      { framework: Frameworks.EDU_CPE, results: eduResults },
    ].forEach(({ framework, results }) => {
      it(`should accept a valid V2 "${framework}" certification result`, function () {
        // when
        const result = CertificationResultV2Schema.safeParse({ ...baseData, framework, results });

        // then
        expect(result.success).to.equal(true);
      });
    });

    it('should accept null values for nullable V2 fields', function () {
      // when
      const result = CertificationResultV2Schema.safeParse({
        ...baseData,
        middleName: null,
        nationalStudentId: null,
        birthPostalCode: null,
        birthINSEECode: null,
        birthCountry: null,
        franceCompetencesMinScore: null,
        commentByAutoJury: null,
        framework: Frameworks.CORE,
        results: coreResults,
      });

      // then
      expect(result.success).to.equal(true);
    });

    [
      { framework: Frameworks.CORE, results: cleaResults },
      { framework: Frameworks.CLEA, results: coreResults },
      { framework: Frameworks.DROIT, results: coreResults },
      { framework: Frameworks.PRO_SANTE, results: cleaResults },
      { framework: Frameworks.EDU_1ER_DEGRE, results: pixPlusResults },
      { framework: Frameworks.EDU_2ND_DEGRE, results: coreResults },
      { framework: Frameworks.EDU_CPE, results: cleaResults },
    ].forEach(({ framework, results }) => {
      it(`should reject a "${framework}" certification result with mismatching results`, function () {
        // when
        const result = CertificationResultV2Schema.safeParse({ ...baseData, framework, results });

        // then
        expect(result.success).to.equal(false);
      });
    });

    it('should reject an unknown framework', function () {
      // when
      const result = CertificationResultV2Schema.safeParse({ ...baseData, framework: 'UNKNOWN', results: coreResults });

      // then
      expect(result.success).to.equal(false);
    });

    [AlgorithmEngineVersion.V1, AlgorithmEngineVersion.V3].forEach((version) => {
      it(`should reject algorithmEngineVersion ${version}`, function () {
        // when
        const result = CertificationResultV2Schema.safeParse({
          ...baseData,
          algorithmEngineVersion: version,
          framework: Frameworks.CORE,
          results: coreResults,
        });

        // then
        expect(result.success).to.equal(false);
      });
    });

    it('should reject a non numeric franceCompetencesMinScore', function () {
      // when
      const result = CertificationResultV2Schema.safeParse({
        ...baseData,
        franceCompetencesMinScore: '120',
        framework: Frameworks.CORE,
        results: coreResults,
      });

      // then
      expect(result.success).to.equal(false);
    });
  });
});
