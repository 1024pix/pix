import { expect } from 'chai';

import { CERTIFICATION_RESULT_STATUSES } from '../../../../../../../src/certification/results/domain/constants.ts';
import {
  BaseCleaResultsSchema,
  BaseCoreResultsSchema,
  BaseSchema,
  CompetenceMarkSchema,
} from '../../../../../../../src/certification/results/domain/models/validators/CertificationResult.ts';

describe('Certification | Results | Unit | Domain | Models | Validators | CertificationResult', function () {
  describe('BaseSchema', function () {
    let validData: Record<string, unknown>;

    beforeEach(function () {
      validData = {
        id: '7c56d60d-27e7-410b-9228-0e81192fb7ec',
        algorithmEngineVersion: 3,
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
        startedAt: new Date('2025-12-30'),
        deliveredAt: new Date('2025-12-31'),
        status: 'validated',
        framework: 'CORE',
        franceCompetencesMinScore: null,
        commentByAutoJury: null,
        commentByJury: null,
        commentForOrganization: null,
        commentForCandidate: null,
      };
    });

    it('should accept valid data', function () {
      // when
      const result = BaseSchema.safeParse(validData);

      // then
      expect(result.success).to.equal(true);
    });

    it('should accept non null nullable string fields', function () {
      // when
      const result = BaseSchema.safeParse({
        ...validData,
        externalId: 'externalId',
        commentByJury: 'commentByJury',
        commentForOrganization: 'commentForOrganization',
        commentForCandidate: 'commentForCandidate',
      });

      // then
      expect(result.success).to.equal(true);
    });

    it('should reject an id that is not a uuid', function () {
      // when
      const result = BaseSchema.safeParse({ ...validData, id: 'not-a-uuid' });

      // then
      expect(result.success).to.equal(false);
    });

    Object.values(CERTIFICATION_RESULT_STATUSES).forEach((status) => {
      it(`should accept status "${status}"`, function () {
        // when
        const result = BaseSchema.safeParse({ ...validData, status });

        // then
        expect(result.success).to.equal(true);
      });
    });

    it('should reject an unknown status', function () {
      // when
      const result = BaseSchema.safeParse({ ...validData, status: 'unknown' });

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject dates given as strings', function () {
      // when
      const result = BaseSchema.safeParse({ ...validData, startedAt: '2025-12-30', deliveredAt: '2025-12-31' });

      // then
      expect(result.success).to.equal(false);
    });

    [
      'middleName',
      'thirdName',
      'nationalStudentId',
      'birthPostalCode',
      'birthINSEECode',
      'birthCountry',
      'franceCompetencesMinScore',
      'commentByAutoJury',
    ].forEach((field) => {
      it(`should reject a non null "${field}"`, function () {
        // when
        const result = BaseSchema.safeParse({ ...validData, [field]: 'some value' });

        // then
        expect(result.success).to.equal(false);
      });
    });

    [
      'firstName',
      'lastName',
      'birthdate',
      'birthplace',
      'verificationCode',
      'certificationCenter',
      'framework',
    ].forEach((field) => {
      it(`should reject a missing "${field}"`, function () {
        // given
        const data = { ...validData };
        delete data[field];

        // when
        const result = BaseSchema.safeParse(data);

        // then
        expect(result.success).to.equal(false);
      });
    });
  });

  describe('CompetenceMarkSchema', function () {
    it('should accept a valid competence mark', function () {
      // when
      const result = CompetenceMarkSchema.safeParse({ competenceId: 'competenceABC123', level: 5 });

      // then
      expect(result.success).to.equal(true);
    });

    it('should accept a level equal to MAX_LEVEL', function () {
      // when
      const result = CompetenceMarkSchema.safeParse({ competenceId: 'competenceABC123', level: 8 });

      // then
      expect(result.success).to.equal(true);
    });

    it('should reject a level above MAX_LEVEL', function () {
      // when
      const result = CompetenceMarkSchema.safeParse({ competenceId: 'competenceABC123', level: 9 });

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject a missing competenceId', function () {
      // when
      const result = CompetenceMarkSchema.safeParse({ level: 3 });

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject a missing level', function () {
      // when
      const result = CompetenceMarkSchema.safeParse({ competenceId: 'competenceABC123' });

      // then
      expect(result.success).to.equal(false);
    });
  });

  describe('BaseCoreResultsSchema', function () {
    it('should accept valid core results', function () {
      // when
      const result = BaseCoreResultsSchema.safeParse({
        pixScore: 512,
        competenceMarks: [{ competenceId: 'competenceABC123', level: 4 }],
      });

      // then
      expect(result.success).to.equal(true);
    });

    it('should accept a null pixScore and no competence marks', function () {
      // when
      const result = BaseCoreResultsSchema.safeParse({ pixScore: null, competenceMarks: [] });

      // then
      expect(result.success).to.equal(true);
    });

    it('should reject an invalid competence mark', function () {
      // when
      const result = BaseCoreResultsSchema.safeParse({
        pixScore: 512,
        competenceMarks: [{ competenceId: 'competenceABC123', level: 42 }],
      });

      // then
      expect(result.success).to.equal(false);
    });
  });

  describe('BaseCleaResultsSchema', function () {
    it('should accept valid clea results', function () {
      // when
      const result = BaseCleaResultsSchema.safeParse({ hasAcquiredClea: true, cleaBadgeId: 123 });

      // then
      expect(result.success).to.equal(true);
    });

    it('should reject a non boolean hasAcquiredClea', function () {
      // when
      const result = BaseCleaResultsSchema.safeParse({ hasAcquiredClea: 'yes', cleaBadgeId: 123 });

      // then
      expect(result.success).to.equal(false);
    });

    it('should reject a null cleaBadgeId', function () {
      // when
      const result = BaseCleaResultsSchema.safeParse({ hasAcquiredClea: false, cleaBadgeId: null });

      // then
      expect(result.success).to.equal(false);
    });
  });
});
