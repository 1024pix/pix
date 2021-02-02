const { expect, domainBuilder } = require('../../../test-helper');
const JuryCertificationSummary = require('../../../../lib/domain/read-models/JuryCertificationSummary');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const forIn = require('lodash/forIn');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Unit | Domain | Models | JuryCertificationSummary', () => {

  describe('#validate', () => {

    context('when a status is given', () => {

      forIn(AssessmentResult.status, (status, key) => {
        it(`should returns "${status}" status`, () => {
          // when
          const juryCertificationSummary = new JuryCertificationSummary({ status });

          // then
          expect(juryCertificationSummary.status).equal(JuryCertificationSummary.statuses[key]);
        });
      });
    });

    context('when no status is given', () => {

      it('should return "started"', () => {
        // when
        const juryCertificationSummary = new JuryCertificationSummary({ status: null });

        // then
        expect(juryCertificationSummary.status).equal(JuryCertificationSummary.statuses.STARTED);
      });
    });
  });

  describe('#isActionRequired', () => {
    context('when at least one issue report requires action', () => {
      it('should return true', () => {
        // given
        const juryCertificationSummary = new JuryCertificationSummary({ certificationIssueReports: [
          domainBuilder.buildCertificationIssueReport({ category: CertificationIssueReportCategories.FRAUD }),
        ] });

        // when
        const isRequired = juryCertificationSummary.isActionRequired();

        // then
        expect(isRequired).to.be.true;
      });

      context('when no issues require action', () => {

        it('should return false', () => {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({ certificationIssueReports: [
            domainBuilder.buildCertificationIssueReport({
              category: CertificationIssueReportCategories.LATE_OR_LEAVING,
              subcategory: CertificationIssueReportSubcategories.SIGNATURE_ISSUE,
            }),
          ] });

          // when
          const isRequired = juryCertificationSummary.isActionRequired();

          // then
          expect(isRequired).to.be.false;
        });
      });
    });
  });

  describe('#hasScoringError', () => {

    context('when assessment result has a scoring error', () => {

      it('should return true', () => {
        // given
        const juryCertificationSummary = new JuryCertificationSummary({ status: AssessmentResult.status.ERROR });

        // when
        const hasScoringError = juryCertificationSummary.hasScoringError();

        // then
        expect(hasScoringError).to.be.true;
      });

      context('when assessment result doesn\'t have a scoring error', () => {

        it('should return false', () => {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({ status: AssessmentResult.status.VALIDATED });

          // when
          const hasScoringError = juryCertificationSummary.hasScoringError();

          // then
          expect(hasScoringError).to.be.false;
        });
      });
    });
  });

  describe('#hasCompletedAssessment', () => {

    context('when assessment is completed', () => {

      it('should return true', () => {
        // given
        const juryCertificationSummary = new JuryCertificationSummary({ status: AssessmentResult.status.REJECTED });

        // when
        const hasCompletedAssessment = juryCertificationSummary.hasCompletedAssessment();

        // then
        expect(hasCompletedAssessment).to.be.true;
      });

      context('when assessment is not completed', () => {

        it('should return false', () => {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({ status: null });

          // when
          const hasCompletedAssessment = juryCertificationSummary.hasCompletedAssessment();

          // then
          expect(hasCompletedAssessment).to.be.false;
        });
      });

    });
  });
});
