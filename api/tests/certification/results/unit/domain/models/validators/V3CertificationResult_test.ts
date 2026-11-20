import { expect } from 'chai';

import {
  CertificationResultV3Schema,
  V3CleaResultsSchema,
  V3CoreResultsSchema,
  V3EduResultsSchema,
  V3PixPlusResultsSchema,
} from '../../../../../../../src/certification/results/domain/models/validators/V3CertificationResult.ts';
import { AlgorithmEngineVersion } from '../../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';

const coreResults = {
  pixScore: 512,
  competenceMarks: [{ competenceId: 'recCompetence', level: 4 }],
  maxReachableLevel: 7,
  reachedMeshIndex: 5,
};
const cleaResults = { ...coreResults, hasAcquiredClea: true, cleaBadgeId: 1 };
const pixPlusResults = { maxReachableLevel: 7, reachedMeshIndex: 2 };
const eduResults = { ...pixPlusResults, v3EduExternalJuryResult: 'EXPERT' };

describe('Certification | Results | Unit | Domain | Models | Validators | V3CertificationResult', function () {
  describe('V3CoreResultsSchema', function () {
    it('should accept valid core results', function () {
      // when
      const result = V3CoreResultsSchema.safeParse(coreResults);

      // then
      expect(result.success).to.equal(true);
    });

    it('should accept a null reachedMeshIndex', function () {
      // when
      const result = V3CoreResultsSchema.safeParse({ ...coreResults, reachedMeshIndex: null });

      // then
      expect(result.success).to.equal(true);
    });

    it('should reject a maxReachableLevel above MAX_LEVEL', function () {
      // when
      const result = V3CoreResultsSchema.safeParse({ ...coreResults, maxReachableLevel: 9 });

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject a missing maxReachableLevel', function () {
      // when
      const result = V3CoreResultsSchema.safeParse({
        pixScore: 512,
        competenceMarks: [],
        reachedMeshIndex: 5,
      });

      // then
      expect(result.success).to.equal(false);
    });
  });

  describe('V3CleaResultsSchema', function () {
    it('should accept valid clea results', function () {
      // when
      const result = V3CleaResultsSchema.safeParse(cleaResults);

      // then
      expect(result.success).to.equal(true);
    });

    it('should reject core results without clea results', function () {
      // when
      const result = V3CleaResultsSchema.safeParse(coreResults);

      // then
      expect(result.success).to.equal(false);
    });
  });

  describe('V3PixPlusResultsSchema', function () {
    it('should accept valid pix plus results', function () {
      // when
      const result = V3PixPlusResultsSchema.safeParse(pixPlusResults);

      // then
      expect(result.success).to.equal(true);
    });

    it('should accept a null reachedMeshIndex', function () {
      // when
      const result = V3PixPlusResultsSchema.safeParse({ ...pixPlusResults, reachedMeshIndex: null });

      // then
      expect(result.success).to.equal(true);
    });

    it('should reject a missing maxReachableLevel', function () {
      // when
      const result = V3PixPlusResultsSchema.safeParse({ reachedMeshIndex: 2 });

      // then
      expect(result.success).to.equal(false);
    });
  });

  describe('V3EduResultsSchema', function () {
    it('should accept valid edu results', function () {
      // when
      const result = V3EduResultsSchema.safeParse(eduResults);

      // then
      expect(result.success).to.equal(true);
    });

    it('should accept a null v3EduExternalJuryResult', function () {
      // when
      const result = V3EduResultsSchema.safeParse({ ...eduResults, v3EduExternalJuryResult: null });

      // then
      expect(result.success).to.equal(true);
    });

    it('should reject a missing v3EduExternalJuryResult', function () {
      // when
      const result = V3EduResultsSchema.safeParse(pixPlusResults);

      // then
      expect(result.success).to.equal(false);
    });
  });

  describe('CertificationResultV3Schema', function () {
    let baseData: Record<string, unknown>;

    beforeEach(function () {
      baseData = {
        id: '7c56d60d-27e7-410b-9228-0e81192fb7ec',
        algorithmEngineVersion: AlgorithmEngineVersion.V3,
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
        startedAt: new Date('2025-12-30'),
        deliveredAt: new Date('2025-12-31'),
        status: 'validated',
        franceCompetencesMinScore: null,
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
      it(`should accept a valid V3 "${framework}" certification result`, function () {
        // when
        const result = CertificationResultV3Schema.safeParse({ ...baseData, framework, results });

        // then
        expect(result.success).to.equal(true);
      });
    });

    [Frameworks.CORE, Frameworks.CLEA].forEach((framework) => {
      it(`should accept a franceCompetencesMinScore for "${framework}"`, function () {
        // when
        const result = CertificationResultV3Schema.safeParse({
          ...baseData,
          franceCompetencesMinScore: 120,
          framework,
          results: framework === Frameworks.CORE ? coreResults : cleaResults,
        });

        // then
        expect(result.success).to.equal(true);
      });
    });

    [
      { framework: Frameworks.DROIT, results: pixPlusResults },
      { framework: Frameworks.PRO_SANTE, results: pixPlusResults },
      { framework: Frameworks.EDU_1ER_DEGRE, results: eduResults },
      { framework: Frameworks.EDU_2ND_DEGRE, results: eduResults },
      { framework: Frameworks.EDU_CPE, results: eduResults },
    ].forEach(({ framework, results }) => {
      it(`should reject a non null franceCompetencesMinScore for "${framework}"`, function () {
        // when
        const result = CertificationResultV3Schema.safeParse({
          ...baseData,
          franceCompetencesMinScore: 120,
          framework,
          results,
        });

        // then
        expect(result.success).to.equal(false);
      });
    });

    [
      { framework: Frameworks.CORE, results: pixPlusResults },
      { framework: Frameworks.CLEA, results: coreResults },
      { framework: Frameworks.DROIT, results: { reachedMeshIndex: 2 } },
      { framework: Frameworks.PRO_SANTE, results: { reachedMeshIndex: 2 } },
      { framework: Frameworks.EDU_1ER_DEGRE, results: pixPlusResults },
      { framework: Frameworks.EDU_2ND_DEGRE, results: pixPlusResults },
      { framework: Frameworks.EDU_CPE, results: pixPlusResults },
    ].forEach(({ framework, results }) => {
      it(`should reject a "${framework}" certification result with mismatching results`, function () {
        // when
        const result = CertificationResultV3Schema.safeParse({ ...baseData, framework, results });

        // then
        expect(result.success).to.equal(false);
      });
    });

    it('should reject an unknown framework', function () {
      // when
      const result = CertificationResultV3Schema.safeParse({ ...baseData, framework: 'UNKNOWN', results: coreResults });

      // then
      expect(result.success).to.equal(false);
    });

    [AlgorithmEngineVersion.V1, AlgorithmEngineVersion.V2].forEach((version) => {
      it(`should reject algorithmEngineVersion ${version}`, function () {
        // when
        const result = CertificationResultV3Schema.safeParse({
          ...baseData,
          algorithmEngineVersion: version,
          framework: Frameworks.CORE,
          results: coreResults,
        });

        // then
        expect(result.success).to.equal(false);
      });
    });
  });
});
