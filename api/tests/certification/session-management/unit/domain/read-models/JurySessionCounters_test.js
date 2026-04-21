import { JurySessionCounters } from '../../../../../../src/certification/session-management/domain/read-models/JurySessionCounters.js';
import {
  CertificationIssueReportCategory,
  ImpactfulCategories,
  ImpactfulSubcategories,
} from '../../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';

describe('Unit | Certification | Session-Management | Domain | Models | JurySessionCounters', function () {
  it('should compute the number of started certifications', function () {
    // given

    // when
    const jurySession = new JurySessionCounters({ startedCertifications: 2 });

    // then
    expect(jurySession.startedCertifications).to.equal(2);
  });

  it('should compute the number of scoring errors', function () {
    // given

    // when
    const jurySession = new JurySessionCounters({ certificationsWithScoringError: 4 });

    // then
    expect(jurySession.certificationsWithScoringError).to.equal(4);
  });

  context('when there are issue reports', function () {
    it('should compute the total number of issue reports', function () {
      // given

      // when
      const jurySession = new JurySessionCounters({
        issueReports: [
          {
            category: CertificationIssueReportCategory.CONNECTION_OR_END_SCREEN,
          },
        ],
      });

      // then
      expect(jurySession.issueReports).to.equal(1);
    });

    it('should detect unresolved impactfull categories', function () {
      // given
      const anImpactfulIssueReport = {
        category: ImpactfulCategories[0],
      };
      const aNonImpactfuIssueReport = {
        category: CertificationIssueReportCategory.CONNECTION_OR_END_SCREEN,
      };

      // when
      const jurySession = new JurySessionCounters({
        issueReports: [anImpactfulIssueReport, aNonImpactfuIssueReport],
      });

      // then
      expect(jurySession.issueReports).to.equal(2);
      expect(jurySession.impactfullIssueReports).to.equal(1);
    });

    it('should detect unresolved impactfull subcategories', function () {
      // given
      const anImpactfulIssueReport = {
        subcategory: ImpactfulSubcategories[0],
      };
      const aNonImpactfuIssueReport = {
        category: CertificationIssueReportCategory.CONNECTION_OR_END_SCREEN,
      };

      // when
      const jurySession = new JurySessionCounters({
        issueReports: [anImpactfulIssueReport, aNonImpactfuIssueReport],
      });

      // then
      expect(jurySession.issueReports).to.equal(2);
      expect(jurySession.impactfullIssueReports).to.equal(1);
    });

    it('should not count as impactfull resolved impactfull categories', function () {
      // given
      const aResolvedImpactfulIssueReport = {
        category: ImpactfulCategories[1],
        resolvedAt: new Date(),
      };
      const aNonImpactfuIssueReport = {
        category: CertificationIssueReportCategory.CONNECTION_OR_END_SCREEN,
      };

      // when
      const jurySession = new JurySessionCounters({
        issueReports: [aResolvedImpactfulIssueReport, aNonImpactfuIssueReport],
      });

      // then
      expect(jurySession.issueReports).to.equal(2);
      expect(jurySession.impactfullIssueReports).to.equal(0);
    });

    it('should not count as impactfull resolved impactfull subcategories', function () {
      // given
      const aResolvedImpactfulIssueReport = {
        subcategory: ImpactfulSubcategories[1],
        resolvedAt: new Date(),
      };
      const aNonImpactfuIssueReport = {
        category: CertificationIssueReportCategory.CONNECTION_OR_END_SCREEN,
      };

      // when
      const jurySession = new JurySessionCounters({
        issueReports: [aResolvedImpactfulIssueReport, aNonImpactfuIssueReport],
      });

      // then
      expect(jurySession.issueReports).to.equal(2);
      expect(jurySession.impactfullIssueReports).to.equal(0);
    });
  });
});
