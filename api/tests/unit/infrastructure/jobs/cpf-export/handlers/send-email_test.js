import { expect, sinon } from '../../../../../test-helper.js';
import { sendEmail } from '../../../../../../lib/infrastructure/jobs/cpf-export/handlers/send-email.js';
import { logger } from '../../../../../../lib/infrastructure/logger.js';

describe('Unit | Infrastructure | jobs | cpf-export | send-email', function () {
  let getPreSignedUrls;
  let mailService;
  beforeEach(function () {
    getPreSignedUrls = sinon.stub();
    mailService = {
      sendCpfEmail: sinon.stub(),
    };
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
      await sendEmail({ getPreSignedUrls, mailService });

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
      sinon.stub(logger, 'info');

      getPreSignedUrls.resolves([]);
      // when
      await sendEmail({ getPreSignedUrls, mailService });

      // then
      expect(mailService.sendCpfEmail).to.not.have.been.called;
      expect(logger.info).to.have.been.calledWithExactly(`No CPF exports files ready to send`);
    });
  });
});
