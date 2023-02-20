import { expect, sinon } from '../../../../../test-helper';
import sendEmail from '../../../../../../lib/infrastructure/jobs/cpf-export/handlers/send-email';
import cronParser from 'cron-parser';
import { cpf } from '../../../../../../lib/config';

describe('Unit | Infrastructure | jobs | cpf-export | send-email', function () {
  let cpfExternalStorage;
  let mailService;
  beforeEach(function () {
    cpfExternalStorage = {
      getPreSignUrlsOfFilesModifiedAfter: sinon.stub(),
    };
    mailService = {
      sendCpfEmail: sinon.stub(),
    };
  });

  it('should get files from external storage modified after the previous planner cron', async function () {
    // given
    const day = '15';
    const month = '01';
    sinon.stub(cpf, 'plannerJob').value({ cron: `0 0 ${day} ${month} *` });

    const expectedDate = new Date('2022-01-15T00:00:00Z');
    const cronExpressionParserStub = {
      prev: () => ({
        toDate: () => expectedDate,
      }),
    };
    sinon.stub(cronParser, 'parseExpression').returns(cronExpressionParserStub);

    // when
    await sendEmail({ cpfExternalStorage, mailService });

    // then
    expect(cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter).to.have.been.calledWith({ date: expectedDate });
  });

  it('should send an email with a list of generated files url', async function () {
    // given
    const day = '15';
    const month = '01';
    sinon.stub(cpf, 'plannerJob').value({ cron: `0 0 ${day} ${month} *` });
    sinon.stub(cpf, 'sendEmailJob').value({ recipient: 'teamcertif@example.net' });

    cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter.resolves([
      'https://bucket.url.com/file1.xml',
      'https://bucket.url.com/file2.xml',
      'https://bucket.url.com/file3.xml',
    ]);
    // when
    await sendEmail({ cpfExternalStorage, mailService });

    // then
    expect(mailService.sendCpfEmail).to.have.been.calledWith({
      email: 'teamcertif@example.net',
      generatedFiles: [
        'https://bucket.url.com/file1.xml',
        'https://bucket.url.com/file2.xml',
        'https://bucket.url.com/file3.xml',
      ],
    });
  });
});
