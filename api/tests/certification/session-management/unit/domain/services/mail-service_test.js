import sinon from 'sinon';

import { CertificationResultsLinkByEmailToken } from '../../../../../../src/certification/results/domain/models/tokens/CertificationResultsLinkByEmailToken.js';
import * as mailService from '../../../../../../src/certification/session-management/domain/services/mail-service.js';
import { ENGLISH_SPOKEN, FRENCH_FRANCE } from '../../../../../../src/shared/domain/services/locale-service.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { mailer } from '../../../../../../src/shared/mail/infrastructure/services/mailer.js';

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
      const sessionDate = '2020-10-03';
      const sessionId = '3';
      const userEmailAddress = 'user@example.net';
      const certificationCenterName = 'Vincennes';
      const resultRecipientEmail = 'email1@example.net';
      const daysBeforeExpiration = 30;
      const link = 'https://test.app.pix.org/api/sessions/download-results/token-1';

      sinon
        .stub(CertificationResultsLinkByEmailToken, 'generate')
        .withArgs({ sessionId, resultRecipientEmail, daysBeforeExpiration })
        .returns('token-1');

      // when
      await mailService.sendCertificationResultEmail({
        email: userEmailAddress,
        sessionId,
        sessionDate,
        certificationCenterName,
        resultRecipientEmail,
        daysBeforeExpiration,
      });

      // then
      const options = mailer.sendEmail.firstCall.args[0];

      const i18nFr = getI18n('fr');
      const i18nEn = getI18n('en');

      expect(options).to.deep.equal({
        from: 'ne-pas-repondre@pix.fr',
        fromName: 'PIX - Ne pas répondre / PIX - Noreply',
        to: userEmailAddress,
        template: 'test-certification-result-template-id',
        variables: {
          fr: {
            homeName: 'pix.fr',
            homeUrl: 'https://pix.fr',
            homeNameInternational: 'pix.org',
            homeUrlInternational: 'https://pix.org/fr',
            link: `${link}?locale=fr`,
            title: i18nFr.__('certification-result-email.title', { sessionId }),
            doNotReply: i18nFr.__('certification-result-email.params.doNotReply'),
            download: i18nFr.__('certification-result-email.params.download'),
            emailValidFor: i18nFr.__('certification-result-email.params.emailValidFor'),
            findOutMore: i18nFr.__('certification-result-email.params.findOutMore'),
            findOutMoreFranceSuffix: i18nFr.__('certification-result-email.params.findOutMoreFranceSuffix'),
            findOutMoreInternationalSuffix: i18nFr.__(
              'certification-result-email.params.findOutMoreInternationalSuffix',
            ),
            guidelines: i18nFr.__('certification-result-email.params.guidelines'),
            guidelinesLinkName: i18nFr.__('certification-result-email.params.guidelinesLinkName'),
            overviewText: i18nFr.__('certification-result-email.params.overviewText'),
            resultsAvailable: i18nFr.__('certification-result-email.params.resultsAvailable'),
            subject: i18nFr.__('certification-result-email.params.subject'),
            viewResultsInProfile: i18nFr.__('certification-result-email.params.viewResultsInProfile'),
          },
          en: {
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/en',
            link: `${link}?locale=en`,
            title: i18nEn.__('certification-result-email.title', { sessionId }),
            doNotReply: i18nEn.__('certification-result-email.params.doNotReply'),
            download: i18nEn.__('certification-result-email.params.download'),
            emailValidFor: i18nEn.__('certification-result-email.params.emailValidFor'),
            findOutMore: i18nEn.__('certification-result-email.params.findOutMore'),
            findOutMoreFranceSuffix: i18nEn.__('certification-result-email.params.findOutMoreFranceSuffix'),
            findOutMoreInternationalSuffix: i18nEn.__(
              'certification-result-email.params.findOutMoreInternationalSuffix',
            ),
            guidelines: i18nEn.__('certification-result-email.params.guidelines'),
            guidelinesLinkName: i18nEn.__('certification-result-email.params.guidelinesLinkName'),
            overviewText: i18nEn.__('certification-result-email.params.overviewText'),
            resultsAvailable: i18nEn.__('certification-result-email.params.resultsAvailable'),
            subject: i18nEn.__('certification-result-email.params.subject'),
            viewResultsInProfile: i18nEn.__('certification-result-email.params.viewResultsInProfile'),
          },
          sessionId,
          sessionDate: '03/10/2020',
          certificationCenterName,
        },
      });
    });
  });
});
