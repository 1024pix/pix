const { expect, domainBuilder } = require('../../../test-helper');
const JuryCertificationSummary = require('../../../../lib/domain/read-models/JuryCertificationSummary');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const forIn = require('lodash/forIn');

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

    context('when the issue report is unresolved', () => {

      context('when the issue report is impactful', () => {

        it('should return true', () => {
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

      context('when the issue report is not impactful', () => {

        it('should return false', () => {
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

    context('when the issue report is resolved', () => {

      context('when the issue report is impactful', () => {

        it('should return false', () => {
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

      context('when the issue report is not impactful', () => {

        it('should return false', () => {
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
