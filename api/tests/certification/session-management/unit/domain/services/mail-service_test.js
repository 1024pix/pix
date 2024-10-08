import * as mailService from '../../../../../../src/certification/session-management/domain/services/mail-service.js';
import { mailer } from '../../../../../../src/shared/mail/infrastructure/services/mailer.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Certification | Session-Management | Domain | Services | MailService', function () {
  beforeEach(function () {
    sinon.stub(mailer, 'sendEmail').resolves();
  });

  describe('#sendNotificationToCertificationCenterRefererForCleaResults', function () {
    it(`should call sendEmail with the right options`, async function () {
      // given
      const email = 'user@example.net';
      const sessionId = 123;
      const sessionDate = new Date('2022-01-01');

      // when
      await mailService.sendNotificationToCertificationCenterRefererForCleaResults({
        email,
        sessionId,
        sessionDate,
      });

      // then
      expect(mailer.sendEmail).to.have.been.calledWithExactly({
        from: 'ne-pas-repondre@pix.fr',
        fromName: 'PIX - Ne pas répondre',
        to: email,
        template: mailer.acquiredCleaResultTemplateId,
        variables: { sessionId, sessionDate: '01/01/2022' },
      });
    });
  });
});
