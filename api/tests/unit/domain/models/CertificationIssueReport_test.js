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

    context('CATEGORY: OTHER', () => {
      const certificationIssueReportDTO = {
        certificationCourseId: 123,
        category: CertificationIssueReportCategories.OTHER,
        description: 'Une description obligatoire',
      };

      it('should create an OTHER CertificationIssueReport', () => {
        expect(CertificationIssueReport.new(certificationIssueReportDTO)).to.be.an.instanceOf(CertificationIssueReport);
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
        it(`should create an OTHER CertificationIssueReport when subcategory is empty with value ${emptyValue}`, () => {
          // when
          expect(CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory: emptyValue }))
            .to.be.an.instanceOf(CertificationIssueReport);
        });
      });
    });

    context('CATEGORY: LATE_OR_LEAVING', () => {
      const certificationIssueReportDTO = {
        certificationCourseId: 123,
        category: CertificationIssueReportCategories.LATE_OR_LEAVING,
        description: 'Une description obligatoire',
        subcategory: CertificationIssueReportSubcategories.LEFT_EXAM_ROOM,
      };

      it('should create a LATE_OR_LEAVING CertificationIssueReport of category', () => {
        expect(CertificationIssueReport.new(certificationIssueReportDTO))
          .to.be.an.instanceOf(CertificationIssueReport);
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
          it(`should create a LATE_OR_LEAVING CertificationIssueReport when subcategory is of value ${subcategory}`, () => {
            // when
            expect(CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory }))
              .to.be.an.instanceOf(CertificationIssueReport);
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

    context('CATEGORY: CANDIDATE_INFORMATIONS_CHANGES', () => {
      const certificationIssueReportDTO = {
        certificationCourseId: 123,
        category: CertificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
        description: 'Une description obligatoire',
        subcategory: CertificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
      };

      it('should create a CANDIDATE_INFORMATIONS_CHANGES CertificationIssueReport', () => {
        expect(CertificationIssueReport.new(certificationIssueReportDTO))
          .to.be.an.instanceOf(CertificationIssueReport);
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
          it(`should create a CANDIDATE_INFORMATIONS_CHANGES CertificationIssueReport when subcategory is of value ${subcategory}`, () => {
            // when
            expect(CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory }))
              .to.be.an.instanceOf(CertificationIssueReport);
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

    context('CATEGORY: CONNECTION_OR_END_SCREEN', () => {
      const certificationIssueReportDTO = {
        certificationCourseId: 123,
        category: CertificationIssueReportCategories.CONNECTION_OR_END_SCREEN,
      };

      it('should create a CONNECTION_OR_END_SCREEN CertificationIssueReport', () => {
        expect(CertificationIssueReport.new(certificationIssueReportDTO))
          .to.be.an.instanceOf(CertificationIssueReport);
      });

      [
        MISSING_VALUE,
        EMPTY_VALUE,
        UNDEFINED_VALUE,
        WHITESPACES_VALUE,
      ].forEach((emptyValue) => {
        it(`should create a CONNECTION_OR_END_SCREEN CertificationIssueReport when description is empty with value ${emptyValue}`, () => {
          // when
          expect(CertificationIssueReport.new({ ...certificationIssueReportDTO, description: emptyValue }))
            .to.be.an.instanceOf(CertificationIssueReport);
        });
      });

      [
        MISSING_VALUE,
        EMPTY_VALUE,
        UNDEFINED_VALUE,
      ].forEach((emptyValue) => {
        it(`should create CONNECTION_OR_END_SCREEN CertificationIssueReport when subcategory is empty with value ${emptyValue}`, () => {
          // when
          expect(CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory: emptyValue }))
            .to.be.an.instanceOf(CertificationIssueReport);
        });
      });
    });

    context('CATEGORY: IN_CHALLENGE', () => {
      const certificationIssueReportDTO = {
        certificationCourseId: 123,
        category: CertificationIssueReportCategories.IN_CHALLENGE,
        subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
        questionNumber: 5,
      };

      it('should create an IN_CHALLENGE CertificationIssueReport', () => {
        expect(CertificationIssueReport.new(certificationIssueReportDTO))
          .to.be.an.instanceOf(CertificationIssueReport);
      });

      // Test dynamically all subcategories
      [...Object.values(CertificationIssueReportSubcategories)].forEach((subcategory) => {
        if ([
          CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
          CertificationIssueReportSubcategories.LINK_NOT_WORKING,
          CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
          CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          CertificationIssueReportSubcategories.WEBSITE_UNAVAILABLE,
          CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
          CertificationIssueReportSubcategories.OTHER,
        ].includes(subcategory)) {
          it(`should create an IN_CHALLENGE CertificationIssueReport when subcategory is of value ${subcategory}`, () => {
            // when
            expect(CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory, description: subcategory === CertificationIssueReportSubcategories.OTHER ? 'salut' : null }))
              .to.be.an.instanceOf(CertificationIssueReport);
          });
        } else {
          it(`should throw an InvalidCertificationIssueReportForSaving when subcategory is ${subcategory}`, () => {
            // when
            expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory }))
              .to.throw(InvalidCertificationIssueReportForSaving);
          });
        }
      });

      [
        CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
        CertificationIssueReportSubcategories.LINK_NOT_WORKING,
        CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
        CertificationIssueReportSubcategories.FILE_NOT_OPENING,
        CertificationIssueReportSubcategories.WEBSITE_UNAVAILABLE,
        CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
      ].forEach((subcategory) => {
        it(`should throw an InvalidCertificationIssueReportForSaving when description is not empty for subcategory ${subcategory}`, () => {
          // when
          expect(() => CertificationIssueReport.new({
            ...certificationIssueReportDTO,
            subcategory,
            description: 'Salut',
          }))
            .to.throw(InvalidCertificationIssueReportForSaving);
        });
      });

      it('should throw an InvalidCertificationIssueReportForSaving when description is empty for subcategory OTHER', () => {
        // when
        expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory: CertificationIssueReportSubcategories.OTHER }))
          .to.throw(InvalidCertificationIssueReportForSaving);
      });

      [
        MISSING_VALUE,
        EMPTY_VALUE,
        UNDEFINED_VALUE,
      ].forEach((emptyValue) => {
        it(`should throw an InvalidCertificationIssueReportForSaving when questionNumber is empty with value ${emptyValue}`, () => {
          // when
          expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, questionNumber: emptyValue }))
            .to.throw(InvalidCertificationIssueReportForSaving);
        });
      });

      it('should throw an InvalidCertificationIssueReportForSaving when questionNumber is over 500', () => {
        // when
        expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, questionNumber: 501 }))
          .to.throw(InvalidCertificationIssueReportForSaving);
      });

      it('should throw an InvalidCertificationIssueReportForSaving when questionNumber is under 1', () => {
        // when
        expect(() => CertificationIssueReport.new({ ...certificationIssueReportDTO, questionNumber: 0 }))
          .to.throw(InvalidCertificationIssueReportForSaving);
      });
    });
    context('CATEGORY: FRAUD', () => {
      const certificationIssueReportDTO = {
        certificationCourseId: 123,
        category: CertificationIssueReportCategories.FRAUD,
      };

      it('it should be valid', () => {
        expect(() => CertificationIssueReport.new(certificationIssueReportDTO)).not.to.throw();
      });
    });

    context('CATEGORY: TECHNICAL_PROBLEM', () => {
      const certificationIssueReportDTO = {
        certificationCourseId: 123,
        category: CertificationIssueReportCategories.TECHNICAL_PROBLEM,
        description: 'Une description obligatoire',
      };

      it('should create an TECHNICAL_PROBLEM CertificationIssueReport', () => {
        expect(CertificationIssueReport.new(certificationIssueReportDTO)).to.be.an.instanceOf(CertificationIssueReport);
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
        it(`should create an TECHNICAL_PROBLEM CertificationIssueReport when subcategory is empty with value ${emptyValue}`, () => {
          // when
          expect(CertificationIssueReport.new({ ...certificationIssueReportDTO, subcategory: emptyValue }))
            .to.be.an.instanceOf(CertificationIssueReport);
        });
      });
    });
  });
});
