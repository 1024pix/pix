import { FinalizedSession } from '../../../../../../src/certification/session-management/domain/models/FinalizedSession.js';
import { JuryCertificationSummary } from '../../../../../../src/certification/session-management/domain/read-models/JuryCertificationSummary.js';
import { CertificationIssueReportCategory } from '../../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { status as assessmentResultStatuses } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Session-Management | Domain | Models | FinalizedSession', function () {
  context('#isPublishable', function () {
    it('is not publishable when session has an examiner global comment', function () {
      // given / when
      const finalizedSession = FinalizedSession.from({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: true,
        juryCertificationSummaries: _noneWithRequiredActionNorError(),
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
      });
      // then
      expect(finalizedSession.isPublishable).to.be.false;
    });

    it('is publishable when session has no global comment, no started or error status, no issue report requiring action and invigilator was used', function () {
      // given / when
      const finalizedSession = FinalizedSession.from({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: false,
        juryCertificationSummaries: _noneWithRequiredActionNorError(),
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
      });

      // then
      expect(finalizedSession.isPublishable).to.be.true;
    });

    context('when invigilator portal was used', function () {
      it('is publishable even if a test end screen has not been seen', function () {
        // when
        const finalizedSession = FinalizedSession.from({
          sessionId: 1234,
          certificationCenterName: 'a certification center',
          sessionDate: '2021-01-29',
          sessionTime: '16:00',
          hasExaminerGlobalComment: false,
          juryCertificationSummaries: _noneWithRequiredActionNorErrorButEndScreenNotSeen(),
          finalizedAt: new Date('2020-01-01T00:00:00Z'),
        });

        // then
        expect(finalizedSession.isPublishable).to.be.true;
      });

      it('is not publishable if a test is not finished yet has no abort reason', function () {
        // when
        const finalizedSession = FinalizedSession.from({
          sessionId: 1234,
          certificationCenterName: 'a certification center',
          sessionDate: '2021-01-29',
          sessionTime: '16:00',
          hasExaminerGlobalComment: false,
          juryCertificationSummaries: _someWhichAreUnfinishedButHaveNoAbortReason(),
          finalizedAt: new Date('2020-01-01T00:00:00Z'),
        });

        // then
        expect(finalizedSession.isPublishable).to.be.false;
      });
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
        juryCertificationSummaries: _noneWithRequiredActionNorError(),
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
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
      });
      // then
      expect(finalizedSession.isPublishable).to.be.true;
    });

    [
      { framework: Frameworks.CORE, isPublishable: true },
      { framework: Frameworks.CLEA, isPublishable: true },
      { framework: Frameworks.EDU_1ER_DEGRE, isPublishable: true },
      { framework: Frameworks.EDU_2ND_DEGRE, isPublishable: true },
      { framework: Frameworks.EDU_CPE, isPublishable: true },
      { framework: Frameworks.DROIT, isPublishable: false },
      { framework: Frameworks.PRO_SANTE, isPublishable: false },
    ].forEach(({ framework, isPublishable }) => {
      it(`session should be ${isPublishable ? 'publishable' : 'not publishable'} for certification ${framework}}`, function () {
        const juryCertificationSummary = new JuryCertificationSummary({
          id: 1,
          firstName: 'firstName',
          lastName: 'lastName',
          status: assessmentResultStatuses.VALIDATED,
          pixScore: 120,
          createdAt: new Date(),
          completedAt: new Date(),
          isPublished: false,
          certificationFramework: framework,
          certificationIssueReports: [],
        });
        const finalizedSession = FinalizedSession.from({
          sessionId: 1234,
          certificationCenterName: 'a certification center',
          sessionDate: '2021-01-29',
          sessionTime: '16:00',
          hasExaminerGlobalComment: false,
          juryCertificationSummaries: [juryCertificationSummary],
          finalizedAt: new Date('2020-01-01T00:00:00Z'),
        });

        // then
        expect(finalizedSession.isPublishable).to.equal(isPublishable);
      });
    });

    it('is not publishable when session has some Pix Plus scope certification', function () {
      // given / when
      const finalizedSession = FinalizedSession.from({
        sessionId: 1234,
        certificationCenterName: 'a certification center',
        sessionDate: '2021-01-29',
        sessionTime: '16:00',
        hasExaminerGlobalComment: false,
        juryCertificationSummaries: _someWithPixPlusScopeCertification(),
        finalizedAt: new Date('2020-01-01T00:00:00Z'),
      });

      // then
      expect(finalizedSession.isPublishable).to.be.false;
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
        juryCertificationSummaries: _noneWithRequiredActionNorError(),
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
        juryCertificationSummaries: _noneWithRequiredActionNorError(),
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
        juryCertificationSummaries: _noneWithRequiredActionNorError(),
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

function _noneWithRequiredActionNorError() {
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
      certificationFramework: Frameworks.CORE,
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: 'NON_IMPACTFUL_CATEGORY',
          subcategory: 'NON_IMPACTFUL_SUBCATEGORY',
        }),
      ],
    }),
  ];
}

function _noneWithRequiredActionNorErrorButEndScreenNotSeen() {
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
      certificationFramework: Frameworks.CORE,
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: 'NON_IMPACTFUL_CATEGORY',
          subcategory: 'NON_IMPACTFUL_SUBCATEGORY',
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
      certificationFramework: Frameworks.CORE,
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: 'NON_IMPACTFUL_CATEGORY',
          subcategory: 'NON_IMPACTFUL_SUBCATEGORY',
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
      certificationFramework: Frameworks.CORE,
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategory.SIGNATURE_ISSUE,
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
      status: 'started',
      pixScore: 120,
      createdAt: new Date(),
      completedAt: null,
      isPublished: false,
      certificationFramework: Frameworks.CORE,
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategory.SIGNATURE_ISSUE,
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
      status: assessmentResultStatuses.VALIDATED,
      pixScore: 120,
      createdAt: new Date(),
      completedAt: new Date(),
      isPublished: false,
      certificationFramework: Frameworks.CORE,
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategory.FRAUD,
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
      status: assessmentResultStatuses.VALIDATED,
      pixScore: 120,
      createdAt: new Date(),
      completedAt: new Date(),
      isPublished: false,
      certificationFramework: Frameworks.CORE,
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategory.FRAUD,
          resolvedAt: new Date('2020-01-01'),
          resolution: 'des points gratos offerts',
        }),
      ],
    }),
  ];
}

function _someWhichAreUnfinishedButHaveNoAbortReason() {
  return [
    new JuryCertificationSummary({
      id: 1,
      firstName: 'firstName',
      lastName: 'lastName',
      status: 'started',
      pixScore: 120,
      createdAt: new Date(),
      completedAt: null,
      isPublished: false,
      abortReason: null,
      certificationFramework: Frameworks.CORE,
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategory.FRAUD,
          resolvedAt: new Date('2020-01-01'),
          resolution: 'des points gratos offerts',
        }),
      ],
    }),
  ];
}

function _someWithPixPlusScopeCertification() {
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
      certificationFramework: Frameworks.CLEA,
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: 'NON_IMPACTFUL_CATEGORY',
          subcategory: 'NON_IMPACTFUL_SUBCATEGORY',
        }),
      ],
    }),
    new JuryCertificationSummary({
      id: 1,
      firstName: 'firstName',
      lastName: 'lastName',
      status: assessmentResultStatuses.VALIDATED,
      pixScore: 120,
      createdAt: new Date(),
      completedAt: new Date(),
      isPublished: false,
      certificationFramework: Frameworks.DROIT,
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: 'NON_IMPACTFUL_CATEGORY',
          subcategory: 'NON_IMPACTFUL_SUBCATEGORY',
        }),
      ],
    }),
  ];
}
