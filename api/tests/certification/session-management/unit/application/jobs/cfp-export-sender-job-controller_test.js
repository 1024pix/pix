import { CpfExportSenderJobController } from '../../../../../../src/certification/session-management/application/jobs/cpf-export-sender-job-controller.js';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Infrastructure | Certification | Sessions Management | jobs | cpf-export-sender-job-controller', function () {
  let getPreSignedUrls;
  let mailService;

  beforeEach(function () {
    sinon.stub(logger, 'info');
    getPreSignedUrls = sinon.stub();
    mailService = { sendCpfEmail: sinon.stub() };
  });

  describe('when generated files are found', function () {
    it('should send an email with a list of generated files url', async function () {
      // given
      getPreSignedUrls.resolves([
        'https://bucket.url.com/file1.xml',
        'https://bucket.url.com/file2.xml',
        'https://bucket.url.com/file3.xml',
      ]);

      // when
      const jobController = new CpfExportSenderJobController();
      await jobController.handle({}, { dependencies: { getPreSignedUrls, mailService } });

      // then
      expect(mailService.sendCpfEmail).to.have.been.calledWithExactly({
        email: 'team-all-star-certif-de-ouf@example.net',
        generatedFiles: [
          'https://bucket.url.com/file1.xml',
          'https://bucket.url.com/file2.xml',
          'https://bucket.url.com/file3.xml',
        ],
      });
    });
  });

  describe('when no generated file is found', function () {
    it('should not send an email', async function () {
      // given
      getPreSignedUrls.resolves([]);

      // when
      const jobController = new CpfExportSenderJobController();
      await jobController.handle({}, { dependencies: { getPreSignedUrls, mailService } });

      // then
      expect(mailService.sendCpfEmail).to.not.have.been.called;
      expect(logger.info).to.have.been.calledWithExactly(`No CPF exports files ready to send`);
    });
  });
});