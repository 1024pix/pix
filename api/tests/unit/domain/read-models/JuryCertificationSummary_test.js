const { expect, domainBuilder } = require('../../../test-helper');
const JuryCertificationSummary = require('../../../../lib/domain/read-models/JuryCertificationSummary');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const forIn = require('lodash/forIn');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Unit | Domain | Models | JuryCertificationSummary', function() {

  describe('#validate', function() {

    context('when a status is given', function() {

      forIn(AssessmentResult.status, (status, key) => {
        it(`should returns "${status}" status`, function() {
          // when
          const juryCertificationSummary = new JuryCertificationSummary({ status });

          // then
          expect(juryCertificationSummary.status).equal(JuryCertificationSummary.statuses[key]);
        });
      });
    });

    context('when no status is given', function() {

      it('should return "started"', function() {
        // when
        const juryCertificationSummary = new JuryCertificationSummary({ status: null });

        // then
        expect(juryCertificationSummary.status).equal(JuryCertificationSummary.statuses.STARTED);
      });
    });
  });

  describe('#isActionRequired', function() {
    context('when at least one issue report requires action', function() {
      it('should return true', function() {
        // given
        const juryCertificationSummary = new JuryCertificationSummary({ certificationIssueReports: [
          domainBuilder.buildCertificationIssueReport({ category: CertificationIssueReportCategories.FRAUD }),
        ] });

        // when
        const isRequired = juryCertificationSummary.isActionRequired();

        // then
        expect(isRequired).to.be.true;
      });

      context('when no issues require action', function() {

        it('should return false', function() {
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

  describe('#hasScoringError', function() {

    context('when assessment result has a scoring error', function() {

      it('should return true', function() {
        // given
        const juryCertificationSummary = new JuryCertificationSummary({ status: AssessmentResult.status.ERROR });

        // when
        const hasScoringError = juryCertificationSummary.hasScoringError();

        // then
        expect(hasScoringError).to.be.true;
      });

      context('when assessment result doesn\'t have a scoring error', function() {

        it('should return false', function() {
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

  describe('#hasCompletedAssessment', function() {

    context('when assessment is completed', function() {

      it('should return true', function() {
        // given
        const juryCertificationSummary = new JuryCertificationSummary({ status: AssessmentResult.status.REJECTED });

        // when
        const hasCompletedAssessment = juryCertificationSummary.hasCompletedAssessment();

        // then
        expect(hasCompletedAssessment).to.be.true;
      });

      context('when assessment is not completed', function() {

        it('should return false', function() {
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
