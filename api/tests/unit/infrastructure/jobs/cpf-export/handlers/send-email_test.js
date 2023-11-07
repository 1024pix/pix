import { expect, sinon } from '../../../../../test-helper.js';
import { sendEmail } from '../../../../../../lib/infrastructure/jobs/cpf-export/handlers/send-email.js';
import cronParser from 'cron-parser';
import { config } from '../../../../../../lib/config.js';
import { logger } from '../../../../../../lib/infrastructure/logger.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import dayOfYear from 'dayjs/plugin/dayOfYear.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayOfYear);

const { cpf } = config;
describe('Unit | Infrastructure | jobs | cpf-export | send-email', function () {
  let getPreSignedUrls;
  let mailService;
  beforeEach(function () {
    getPreSignedUrls = sinon.stub();
    mailService = {
      sendCpfEmail: sinon.stub(),
    };
  });

  it('should get files from external storage modified after the previous planner cron', async function () {
    // given
    const day = '15';
    const month = '01';
    sinon.stub(cpf, 'plannerJob').value({ cron: `0 0 ${day} ${month} *` });
    getPreSignedUrls.resolves([
      'https://bucket.url.com/file1.xml',
      'https://bucket.url.com/file2.xml',
      'https://bucket.url.com/file3.xml',
    ]);

    const expectedDate = new Date('2022-01-15T00:00:00Z');
    const cronExpressionParserStub = {
      prev: () => ({
        toDate: () => expectedDate,
      }),
    };
    sinon.stub(cronParser, 'parseExpression').returns(cronExpressionParserStub);

    // when
    await sendEmail({ getPreSignedUrls, mailService });

    // then
    expect(getPreSignedUrls).to.have.been.calledWithExactly({
      date: expectedDate,
    });
  });

  describe('when generated files are found', function () {
    it('should send an email with a list of generated files url', async function () {
      // given
      const day = '15';
      const month = '01';
      sinon.stub(cpf, 'plannerJob').value({ cron: `0 0 ${day} ${month} *` });
      sinon.stub(cpf, 'sendEmailJob').value({ recipient: 'teamcertif@example.net' });

      getPreSignedUrls.resolves([
        'https://bucket.url.com/file1.xml',
        'https://bucket.url.com/file2.xml',
        'https://bucket.url.com/file3.xml',
      ]);
      // when
      await sendEmail({ getPreSignedUrls, mailService });

      // then
      expect(mailService.sendCpfEmail).to.have.been.calledWithExactly({
        email: 'teamcertif@example.net',
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
      const loggedDate = dayjs().tz('Europe/Paris').second(0).minute(11).hour(12).dayOfYear(15).month(0).toDate();
      sinon.stub(cpf, 'plannerJob').value({ cron: '11 12 15 01 *' });
      sinon.stub(logger, 'info');

      getPreSignedUrls.resolves([]);
      // when
      await sendEmail({ getPreSignedUrls, mailService });

      // then
      expect(mailService.sendCpfEmail).to.not.have.been.called;
      expect(logger.info).to.have.been.calledWithExactly(`No new generated cpf files since ${loggedDate.toString()}`);
    });
  });
});
