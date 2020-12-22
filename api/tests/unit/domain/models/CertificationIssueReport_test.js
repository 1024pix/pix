const { expect } = require('../../../test-helper');
const CertificationIssueReport = require('../../../../lib/domain/models/CertificationIssueReport');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');
const { InvalidCertificationIssueReportForSaving } = require('../../../../lib/domain/errors');

const MISSING_VALUE = null;
const EMPTY_VALUE = '';
const WHITESPACES_VALUE = '  ';
const UNDEFINED_VALUE = undefined;

describe('Unit | Domain | Models | CertificationIssueReport', () => {

  describe('#new', () => {

    context('CATEGORY : OTHER', () => {
      const certificationIssueReportDTO = {
        certificationCourseId: 123,
        category: CertificationIssueReportCategories.OTHER,
        description: 'Une description obligatoire',
      };

      it('should not throw any error', () => {
        expect(() => CertificationIssueReport.new(certificationIssueReportDTO)).to.not.throw;
      });

      [
        MISSING_VALUE,
        EMPTY_VALUE,
        UNDEFINED_VALUE,
        WHITESPACES_VALUE,
      ].forEach((emptyValue) => {
        it(`should throw an InvalidCertificationIssueReportForSaving when description is of value ${emptyValue}`, () => {
          // when
          expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, description: emptyValue }))
            .to.throw(InvalidCertificationIssueReportForSaving);
        });
      });

      [
        MISSING_VALUE,
        EMPTY_VALUE,
        UNDEFINED_VALUE,
      ].forEach((emptyValue) => {
        it(`should not throw any error when subcategory is empty with value ${emptyValue}`, () => {
          // when
          expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory: emptyValue }))
            .to.not.throw(InvalidCertificationIssueReportForSaving);
        });
      });

      it('should throw an InvalidCertificationIssueReportForSaving when subcategory is not empty', () => {
        // when
        expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory: 'Salut' }))
          .to.throw(InvalidCertificationIssueReportForSaving);
      });
    });

    context('CATEGORY : LATE_OR_LEAVING', () => {
      const certificationIssueReportDTO = {
        certificationCourseId: 123,
        category: CertificationIssueReportCategories.LATE_OR_LEAVING,
        description: 'Une description obligatoire',
        subcategory: CertificationIssueReportSubcategories.LEFT_EXAM_ROOM,
      };

      it('should not throw any error', () => {
        expect(() => CertificationIssueReport.new(certificationIssueReportDTO)).to.not.throw;
      });

      [
        MISSING_VALUE,
        EMPTY_VALUE,
        UNDEFINED_VALUE,
        WHITESPACES_VALUE,
      ].forEach((emptyValue) => {
        it(`should throw an InvalidCertificationIssueReportForSaving when description is of value ${emptyValue}`, () => {
          // when
          expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, description: emptyValue }))
            .to.throw(InvalidCertificationIssueReportForSaving);
        });
      });

      // Test dynamically all subcategories
      [...Object.values(CertificationIssueReportSubcategories)].forEach((subcategory) => {
        if ([CertificationIssueReportSubcategories.LEFT_EXAM_ROOM, CertificationIssueReportSubcategories.SIGNATURE_ISSUE].includes(subcategory)) {
          it(`should not throw any error when subcategory is of value ${subcategory}`, () => {
            // when
            expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory }))
              .to.not.throw(InvalidCertificationIssueReportForSaving);
          });
        } else {
          it(`should throw an InvalidCertificationIssueReportForSaving when subcategory is ${subcategory}`, () => {
            // when
            expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory }))
              .to.throw(InvalidCertificationIssueReportForSaving);
          });
        }
      });
    });

    context('CATEGORY : CANDIDATE_INFORMATIONS_CHANGES', () => {
      const certificationIssueReportDTO = {
        certificationCourseId: 123,
        category: CertificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
        description: 'Une description obligatoire',
        subcategory: CertificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
      };

      it('should not throw any error', () => {
        expect(() => CertificationIssueReport.new(certificationIssueReportDTO)).to.not.throw;
      });

      [
        MISSING_VALUE,
        EMPTY_VALUE,
        UNDEFINED_VALUE,
        WHITESPACES_VALUE,
      ].forEach((emptyValue) => {
        it(`should throw an InvalidCertificationIssueReportForSaving when description is of value ${emptyValue}`, () => {
          // when
          expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, description: emptyValue }))
            .to.throw(InvalidCertificationIssueReportForSaving);
        });
      });

      // Test dynamically all subcategories
      [...Object.values(CertificationIssueReportSubcategories)].forEach((subcategory) => {
        if ([CertificationIssueReportSubcategories.NAME_OR_BIRTHDATE, CertificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE].includes(subcategory)) {
          it(`should not throw any error when subcategory is of value ${subcategory}`, () => {
            // when
            expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory }))
              .to.not.throw(InvalidCertificationIssueReportForSaving);
          });
        } else {
          it(`should throw an InvalidCertificationIssueReportForSaving when subcategory is ${subcategory}`, () => {
            // when
            expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory }))
              .to.throw(InvalidCertificationIssueReportForSaving);
          });
        }
      });
    });

    context('CATEGORY : CONNECTION_OR_END_SCREEN', () => {
      const certificationIssueReportDTO = {
        certificationCourseId: 123,
        category: CertificationIssueReportCategories.CONNECTION_OR_END_SCREEN,
      };

      it('should not throw any error', () => {
        expect(() => CertificationIssueReport.new(certificationIssueReportDTO)).to.not.throw;
      });

      [
        MISSING_VALUE,
        EMPTY_VALUE,
        UNDEFINED_VALUE,
        WHITESPACES_VALUE,
      ].forEach((emptyValue) => {
        it(`should not throw any error when description is empty with value ${emptyValue}`, () => {
          // when
          expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, description: emptyValue }))
            .to.not.throw(InvalidCertificationIssueReportForSaving);
        });
      });

      it('should throw an InvalidCertificationIssueReportForSaving when description is not empty', () => {
        // when
        expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, description: 'Salut' }))
          .to.throw(InvalidCertificationIssueReportForSaving);
      });

      [
        MISSING_VALUE,
        EMPTY_VALUE,
        UNDEFINED_VALUE,
      ].forEach((emptyValue) => {
        it(`should not throw any error when subcategory is empty with value ${emptyValue}`, () => {
          // when
          expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory: emptyValue }))
            .to.not.throw(InvalidCertificationIssueReportForSaving);
        });
      });

      it('should throw an InvalidCertificationIssueReportForSaving when subcategory is not empty', () => {
        // when
        expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory: 'Salut' }))
          .to.throw(InvalidCertificationIssueReportForSaving);
      });
    });
  });
});
