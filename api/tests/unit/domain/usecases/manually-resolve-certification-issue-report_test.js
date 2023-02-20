import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import manuallyResolveCertificationIssueReport from '../../../../lib/domain/usecases/manually-resolve-certification-issue-report';
import { CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually } from '../../../../lib/domain/errors';

describe('Unit | UseCase | manually-resolve-certification-issue-report', function () {
  describe('when certification issue report is not resolved', function () {
    it('should resolve and save certification issue report', async function () {
      // given
      const certificationIssueReportRepository = {
        get: sinon.stub(),
        save: sinon.stub(),
      };
      const resolution = 'issue solved';
      const certificationIssueReportId = 1;
      const expectedCertificationIssueReport = domainBuilder.buildCertificationIssueReport({
        hasBeenAutomaticallyResolved: null,
      });
      sinon.spy(expectedCertificationIssueReport, 'resolveManually');
      certificationIssueReportRepository.get.resolves(expectedCertificationIssueReport);
      certificationIssueReportRepository.save.resolves();

      // when
      await manuallyResolveCertificationIssueReport({
        resolution,
        certificationIssueReportRepository,
        certificationIssueReportId,
      });

      // then
      expect(certificationIssueReportRepository.get).to.have.been.called;
      expect(certificationIssueReportRepository.save).to.have.been.calledWith(expectedCertificationIssueReport);
      expect(expectedCertificationIssueReport.resolveManually).to.have.been.calledWith(resolution);
    });
  });

  describe('when certification issue report is resolved', function () {
    describe('when certification issue report is resolved manually', function () {
      it('should update certification issue report', async function () {
        // given
        const certificationIssueReportRepository = {
          get: sinon.stub(),
          save: sinon.stub(),
        };
        const resolution = 'issue solved';
        const certificationIssueReportId = 1;
        const expectedCertificationIssueReport = domainBuilder.buildCertificationIssueReport({
          hasBeenAutomaticallyResolved: false,
        });
        certificationIssueReportRepository.get.resolves(expectedCertificationIssueReport);
        certificationIssueReportRepository.save.resolves();

        // when
        await manuallyResolveCertificationIssueReport({
          resolution,
          certificationIssueReportRepository,
          certificationIssueReportId,
        });

        // then
        expect(certificationIssueReportRepository.save).to.have.been.calledWith(expectedCertificationIssueReport);
      });
    });

    describe('when certification issue report is resolved automatically', function () {
      it('should throw a CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually error', async function () {
        // given
        const certificationIssueReportRepository = {
          get: sinon.stub(),
          save: sinon.stub(),
        };
        const resolution = 'issue solved';
        const certificationIssueReportId = 1;
        const expectedCertificationIssueReport = domainBuilder.buildCertificationIssueReport({
          hasBeenAutomaticallyResolved: true,
        });
        certificationIssueReportRepository.get.resolves(expectedCertificationIssueReport);
        certificationIssueReportRepository.save.resolves();

        // when
        const error = await catchErr(manuallyResolveCertificationIssueReport)({
          resolution,
          certificationIssueReportRepository,
          certificationIssueReportId,
        });

        // then
        expect(error).to.be.instanceOf(CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually);
      });
    });
  });
});
