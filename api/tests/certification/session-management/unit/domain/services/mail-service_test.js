import * as mailService from '../../../../../../src/certification/session-management/domain/services/mail-service.js';
import { config as settings } from '../../../../../../src/shared/config.js';
import { ENGLISH_SPOKEN, FRENCH_FRANCE } from '../../../../../../src/shared/domain/services/locale-service.js';
import { tokenService } from '../../../../../../src/shared/domain/services/token-service.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { mailer } from '../../../../../../src/shared/mail/infrastructure/services/mailer.js';
import en from '../../../../../../translations/en.json' with { type: 'json' };
import fr from '../../../../../../translations/fr.json' with { type: 'json' };
import { es } from '../../../../../../translations/index.js';
import nl from '../../../../../../translations/nl.json' with { type: 'json' };
import { expect, sinon } from '../../../../../test-helper.js';

const mainTranslationsMapping = {
  fr,
  en,
  nl,
  es,
};

const i18n = getI18n();

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

  describe('#sendCertificationResultEmail', function () {
    it(`should call sendEmail with from, to, template, tags, ${FRENCH_FRANCE} and ${ENGLISH_SPOKEN} translations`, async function () {
      // given
      sinon.stub(settings.domain, 'pixApp').value('https://pix.app');
      const translate = i18n.__;
      const sessionDate = '2020-10-03';
      const sessionId = '3';
      const userEmailAddress = 'user@example.net';
      const certificationCenterName = 'Vincennes';
      const resultRecipientEmail = 'email1@example.net';
      const daysBeforeExpiration = 30;
      const tokenServiceStub = sinon.stub(tokenService, 'createCertificationResultsByRecipientEmailLinkToken');
      tokenServiceStub.withArgs({ sessionId, resultRecipientEmail, daysBeforeExpiration }).returns('token-1');
      const link = 'https://pix.app.org/api/sessions/download-results/token-1';

      // when
      await mailService.sendCertificationResultEmail({
        email: userEmailAddress,
        sessionId,
        sessionDate,
        certificationCenterName,
        resultRecipientEmail,
        daysBeforeExpiration,
        translate,
      });

      // then
      const options = mailer.sendEmail.firstCall.args[0];

      expect(options).to.deep.equal({
        from: 'ne-pas-repondre@pix.fr',
        fromName: 'PIX - Ne pas répondre / PIX - Noreply',
        to: userEmailAddress,
        template: 'test-certification-result-template-id',
        variables: {
          fr: {
            ...mainTranslationsMapping.fr['certification-result-email'].params,
            title: translate('certification-result-email.title', { sessionId }),
            homeName: 'pix.fr',
            homeUrl: 'https://pix.fr',
            homeNameInternational: 'pix.org',
            homeUrlInternational: 'https://pix.org/fr/',
            link: `${link}?lang=fr`,
          },
          en: {
            ...mainTranslationsMapping.en['certification-result-email'].params,
            title: translate({ phrase: 'certification-result-email.title', locale: 'en' }, { sessionId }),
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/en/',
            link: `${link}?lang=en`,
          },
          sessionId,
          sessionDate: '03/10/2020',
          certificationCenterName,
        },
      });
    });
  });
});
