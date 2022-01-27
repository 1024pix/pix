const { expect, domainBuilder } = require('../../../test-helper');
const FinalizedSession = require('../../../../lib/domain/models/FinalizedSession');
const JuryCertificationSummary = require('../../../../lib/domain/read-models/JuryCertificationSummary');
const { status: assessmentResultStatuses } = require('../../../../lib/domain/models/AssessmentResult');
const {
  CertificationIssueReportCategories,
  CertificationIssueReportSubcategories,
} = require('../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Unit | Domain | Models | FinalizedSession', function () {
  context('#isPublishable', function () {
    it('is not publishable when session has an examiner global comment', function () {
      // given / when
      const finalizedSession = FinalizedSession.from({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: true,
        juryCertificationSummaries: _noneWithRequiredActionNorErrorOrStartedStatus(),
        hasSupervisorAccess: false,
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
      });
      // then
      expect(finalizedSession.isPublishable).to.be.false;
    });

    context('when supervisor space was not used', function () {
      it('is not publishable when at least one test end screen has not been seen', function () {
        // given / when
        const finalizedSession = FinalizedSession.from({
          sessionId: 1234,
          certificationCenterName: 'a certification center',
          sessionDate: '2021-01-29',
          sessionTime: '16:00',
          hasExaminerGlobalComment: false,
          juryCertificationSummaries: _noneWithRequiredActionNorErrorOrStartedStatusButEndScreenNotSeen(),
          hasSupervisorAccess: false,
          finalizedAt: new Date('2020-01-01T00:00:00Z'),
        });

        // then
        expect(finalizedSession.isPublishable).to.be.false;
      });
    });

    context('when supervisor space was used', function () {
      it('is publishable even if an test end screen has not been seen', function () {
        // when
        const finalizedSession = FinalizedSession.from({
          sessionId: 1234,
          certificationCenterName: 'a certification center',
          sessionDate: '2021-01-29',
          sessionTime: '16:00',
          hasExaminerGlobalComment: false,
          juryCertificationSummaries: _noneWithRequiredActionNorErrorOrStartedStatusButEndScreenNotSeen(),
          hasSupervisorAccess: true,
          finalizedAt: new Date('2020-01-01T00:00:00Z'),
        });

        // then
        expect(finalizedSession.isPublishable).to.be.true;
      });
    });

    it('is not publishable when at least one test is not completed and has an abort reason', function () {
      // given / when
      const finalizedSession = FinalizedSession.from({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: false,
        juryCertificationSummaries: _someWhichAreFlaggedAborted(),
        hasSupervisorAccess: false,
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
      });
      // then
      expect(finalizedSession.isPublishable).to.be.false;
    });

    it('is not publishable when has at least one unresolved issue report that requires action', function () {
      // given / when
      const finalizedSession = FinalizedSession.from({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: false,
        juryCertificationSummaries: _someWithUnresolvedRequiredActionButNoErrorOrStartedStatus(),
        hasSupervisorAccess: false,
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
      });
      // then
      expect(finalizedSession.isPublishable).to.be.false;
    });

    it('is not publishable when at least one scoring error occurred', function () {
      // given / when
      const finalizedSession = FinalizedSession.from({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: false,
        juryCertificationSummaries: _noneWithRequiredActionButSomeErrorStatus(),
        hasSupervisorAccess: false,
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
      });

      // then
      expect(finalizedSession.isPublishable).to.be.false;
    });

    it('is not publishable when at least one assessment has not been completed', function () {
      // given / when
      const finalizedSession = FinalizedSession.from({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: false,
        juryCertificationSummaries: _noneWithRequiredActionButSomeStartedStatus(),
        hasSupervisorAccess: false,
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
      });

      // then
      expect(finalizedSession.isPublishable).to.be.false;
    });

    it('is publishable when session has no global comment, no started or error status, no issue report requiring action and all end screen seen', function () {
      // given / when
      const finalizedSession = FinalizedSession.from({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: false,
        juryCertificationSummaries: _noneWithRequiredActionNorErrorOrStartedStatus(),
        hasSupervisorAccess: false,
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
      });

      // then
      expect(finalizedSession.isPublishable).to.be.true;
    });

    it('is publishable when session has no global comment, no started or error status, no issue report requiring action and supervisor was used', function () {
      // given / when
      const finalizedSession = FinalizedSession.from({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: false,
        juryCertificationSummaries: _noneWithRequiredActionNorErrorOrStartedStatus(),
        hasSupervisorAccess: true,
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
      });

      // then
      expect(finalizedSession.isPublishable).to.be.true;
    });

    it('is publishable when has no unresolved issue reports that requires action', function () {
      // given / when
      const finalizedSession = FinalizedSession.from({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: false,
        juryCertificationSummaries: _someWithResolvedRequiredActionButNoErrorOrStartedStatus(),
        hasSupervisorAccess: false,
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
      });
      // then
      expect(finalizedSession.isPublishable).to.be.true;
    });
  });

  context('#assignCertificationOfficer', function () {
    it('Assigns certification officer and make the session not publishable', function () {
      // given / when
      const certificationOfficerName = 'Ruppert Giles';
      const finalizedSession = new FinalizedSession({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: false,
        juryCertificationSummaries: _noneWithRequiredActionNorErrorOrStartedStatus(),
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
        isPublishable: true,
        publishedAt: null,
        assignedCertificationOfficerName: null,
      });

      finalizedSession.assignCertificationOfficer({ certificationOfficerName });

      // then
      expect(finalizedSession.isPublishable).to.be.false;
      expect(finalizedSession.assignedCertificationOfficerName).to.equal(certificationOfficerName);
    });
  });

  context('#publish', function () {
    it('publishes the session', function () {
      // given
      const now = new Date();
      const session = new FinalizedSession({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: false,
        juryCertificationSummaries: _noneWithRequiredActionNorErrorOrStartedStatus(),
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
        isPublishable: true,
        publishedAt: null,
        assignedCertificationOfficerName: null,
      });

      // when
      session.publish(now);

      // then
      expect(session.publishedAt).to.equal(now);
    });
  });

  context('#unpublish', function () {
    it('unpublishes the session', function () {
      const session = new FinalizedSession({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: false,
        juryCertificationSummaries: _noneWithRequiredActionNorErrorOrStartedStatus(),
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
        isPublishable: true,
        publishedAt: new Date(),
        assignedCertificationOfficerName: null,
      });

      // when
      session.unpublish();

      // then
      expect(session.publishedAt).to.be.null;
    });
  });
});

function _noneWithRequiredActionNorErrorOrStartedStatus() {
  return [
    new JuryCertificationSummary({
      id: 1,
      firstName: 'firstName',
      lastName: 'lastName',
      status: assessmentResultStatuses.VALIDATED,
      pixScore: 120,
      createdAt: new Date(),
      completedAt: new Date(),
      isPublished: false,
      hasSeenEndTestScreen: true,
      cleaCertificationStatus: 'not_passed',
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategories.LATE_OR_LEAVING,
          subcategory: CertificationIssueReportSubcategories.SIGNATURE_ISSUE,
        }),
      ],
    }),
  ];
}

function _noneWithRequiredActionNorErrorOrStartedStatusButEndScreenNotSeen() {
  return [
    new JuryCertificationSummary({
      id: 1,
      firstName: 'firstName',
      lastName: 'lastName',
      status: assessmentResultStatuses.VALIDATED,
      pixScore: 120,
      createdAt: new Date(),
      completedAt: new Date(),
      isPublished: false,
      hasSeenEndTestScreen: false,
      cleaCertificationStatus: 'not_passed',
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategories.LATE_OR_LEAVING,
          subcategory: CertificationIssueReportSubcategories.SIGNATURE_ISSUE,
        }),
      ],
    }),
    new JuryCertificationSummary({
      id: 2,
      firstName: 'firstName',
      lastName: 'lastName',
      status: assessmentResultStatuses.VALIDATED,
      pixScore: 120,
      createdAt: new Date(),
      completedAt: new Date(),
      isPublished: false,
      hasSeenEndTestScreen: true,
      cleaCertificationStatus: 'not_passed',
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategories.LATE_OR_LEAVING,
          subcategory: CertificationIssueReportSubcategories.SIGNATURE_ISSUE,
        }),
      ],
    }),
  ];
}

function _noneWithRequiredActionButSomeErrorStatus() {
  return [
    new JuryCertificationSummary({
      id: 1,
      firstName: 'firstName',
      lastName: 'lastName',
      status: assessmentResultStatuses.ERROR,
      pixScore: 120,
      createdAt: new Date(),
      completedAt: new Date(),
      isPublished: false,
      hasSeenEndTestScreen: true,
      cleaCertificationStatus: 'not_passed',
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategories.LATE_OR_LEAVING,
          subcategory: CertificationIssueReportSubcategories.SIGNATURE_ISSUE,
        }),
      ],
    }),
  ];
}

function _noneWithRequiredActionButSomeStartedStatus() {
  return [
    new JuryCertificationSummary({
      id: 1,
      firstName: 'firstName',
      lastName: 'lastName',
      status: null,
      pixScore: 120,
      createdAt: new Date(),
      completedAt: new Date(),
      isPublished: false,
      hasSeenEndTestScreen: true,
      cleaCertificationStatus: 'not_passed',
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategories.LATE_OR_LEAVING,
          subcategory: CertificationIssueReportSubcategories.SIGNATURE_ISSUE,
        }),
      ],
    }),
  ];
}

function _someWithUnresolvedRequiredActionButNoErrorOrStartedStatus() {
  return [
    new JuryCertificationSummary({
      id: 1,
      firstName: 'firstName',
      lastName: 'lastName',
      status: 'validated',
      pixScore: 120,
      createdAt: new Date(),
      completedAt: new Date(),
      isPublished: false,
      hasSeenEndTestScreen: true,
      cleaCertificationStatus: 'not_passed',
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategories.FRAUD,
          resolvedAt: null,
          resolution: null,
        }),
      ],
    }),
  ];
}

function _someWithResolvedRequiredActionButNoErrorOrStartedStatus() {
  return [
    new JuryCertificationSummary({
      id: 1,
      firstName: 'firstName',
      lastName: 'lastName',
      status: 'validated',
      pixScore: 120,
      createdAt: new Date(),
      completedAt: new Date(),
      isPublished: false,
      hasSeenEndTestScreen: true,
      cleaCertificationStatus: 'not_passed',
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategories.FRAUD,
          resolvedAt: new Date('2020-01-01'),
          resolution: 'des points gratos offerts',
        }),
      ],
    }),
  ];
}

function _someWhichAreFlaggedAborted() {
  return [
    new JuryCertificationSummary({
      id: 1,
      firstName: 'firstName',
      lastName: 'lastName',
      status: 'validated',
      pixScore: 120,
      createdAt: new Date(),
      completedAt: null,
      isPublished: false,
      hasSeenEndTestScreen: true,
      abortReason: 'candidate',
      cleaCertificationStatus: 'not_passed',
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategories.FRAUD,
          resolvedAt: new Date('2020-01-01'),
          resolution: 'des points gratos offerts',
        }),
      ],
    }),
  ];
}
