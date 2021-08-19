const { expect, domainBuilder } = require('../../../test-helper');
const JuryCertificationSummary = require('../../../../lib/domain/read-models/JuryCertificationSummary');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const forIn = require('lodash/forIn');

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

    context('when the issue report is unresolved', function() {

      context('when the issue report is impactful', function() {

        it('should return true', function() {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({ certificationIssueReports: [
            domainBuilder.buildCertificationIssueReport.impactful({ resolvedAt: null }),
          ] });

          // when
          const isRequired = juryCertificationSummary.isActionRequired();

          // then
          expect(isRequired).to.be.true;
        });
      });

      context('when the issue report is not impactful', function() {

        it('should return false', function() {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({ certificationIssueReports: [
            domainBuilder.buildCertificationIssueReport.notImpactful({ resolvedAt: null }),
          ] });

          // when
          const isRequired = juryCertificationSummary.isActionRequired();

          // then
          expect(isRequired).to.be.false;
        });
      });
    });

    context('when the issue report is resolved', function() {

      context('when the issue report is impactful', function() {

        it('should return false', function() {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({ certificationIssueReports: [
            domainBuilder.buildCertificationIssueReport.impactful({ resolvedAt: new Date('2020-01-01'), resolution: 'coucou' }),
          ] });

          // when
          const isRequired = juryCertificationSummary.isActionRequired();

          // then
          expect(isRequired).to.be.false;
        });
      });

      context('when the issue report is not impactful', function() {

        it('should return false', function() {
          // given
          const juryCertificationSummary = new JuryCertificationSummary({ certificationIssueReports: [
            domainBuilder.buildCertificationIssueReport.notImpactful({ resolvedAt: new Date('2020-01-01') }),
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
