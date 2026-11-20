import { expect } from 'chai';

import { CertificationResultV1Schema } from '../../../../../../../src/certification/results/domain/models/validators/V1CertificationResult.ts';
import { AlgorithmEngineVersion } from '../../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';

describe('Certification | Results | Unit | Domain | Models | Validators | V1CertificationResult', function () {
  describe('CertificationResultV1Schema', function () {
    let validData: Record<string, unknown>;

    beforeEach(function () {
      validData = {
        id: '7c56d60d-27e7-410b-9228-0e81192fb7ec',
        algorithmEngineVersion: AlgorithmEngineVersion.V1,
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
        certificationCenter: 'Centre de certification',
        startedAt: new Date('2018-12-30'),
        deliveredAt: new Date('2018-12-31'),
        status: 'validated',
        framework: Frameworks.CORE,
        franceCompetencesMinScore: null,
        commentByAutoJury: null,
        commentByJury: null,
        commentForOrganization: null,
        commentForCandidate: null,
        results: {
          pixScore: 256,
          competenceMarks: [{ competenceId: 'competenceABC123', level: 3 }],
        },
      };
    });

    it('should accept a valid V1 CORE certification result', function () {
      // when
      const result = CertificationResultV1Schema.safeParse(validData);

      // then
      expect(result.success).to.equal(true);
    });

    [AlgorithmEngineVersion.V2, AlgorithmEngineVersion.V3].forEach((version) => {
      it(`should reject algorithmEngineVersion ${version}`, function () {
        // when
        const result = CertificationResultV1Schema.safeParse({ ...validData, algorithmEngineVersion: version });

        // then
        expect(result.success).to.equal(false);
      });
    });

    Object.values(Frameworks)
      .filter((framework) => framework !== Frameworks.CORE)
      .forEach((framework) => {
        it(`should reject framework "${framework}"`, function () {
          // when
          const result = CertificationResultV1Schema.safeParse({ ...validData, framework });

          // then
          expect(result.success).to.equal(false);
        });
      });

    it('should reject missing results', function () {
      // given
      delete validData.results;

      // when
      const result = CertificationResultV1Schema.safeParse(validData);

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject invalid results', function () {
      // when
      const result = CertificationResultV1Schema.safeParse({
        ...validData,
        results: { pixScore: 256, competenceMarks: [{ competenceId: 'competenceABC123', level: 99999 }] },
      });

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject a non null nationalStudentId', function () {
      // when
      const result = CertificationResultV1Schema.safeParse({ ...validData, nationalStudentId: '123456789AB' });

      // then
      expect(result.success).to.equal(false);
    });
  });
});
