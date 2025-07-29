import { config } from '../../../../../src/shared/config.js';
import {
  DUTCH_SPOKEN,
  ENGLISH_SPOKEN,
  FRENCH_FRANCE,
  FRENCH_SPOKEN,
  SPANISH_SPOKEN,
} from '../../../../../src/shared/domain/services/locale-service.js';
import * as mailService from '../../../../../src/shared/domain/services/mail-service.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { mailer } from '../../../../../src/shared/mail/infrastructure/services/mailer.js';
import en from '../../../../../translations/en.json' with { type: 'json' };
import fr from '../../../../../translations/fr.json' with { type: 'json' };
import { es } from '../../../../../translations/index.js';
import nl from '../../../../../translations/nl.json' with { type: 'json' };
import { expect, sinon } from '../../../../test-helper.js';

const mainTranslationsMapping = { fr, en, nl, es };

const i18n = getI18n();

describe('Unit | Service | MailService', function () {
  const senderEmailAddress = 'ne-pas-repondre@pix.fr';
  const userEmailAddress = 'user@example.net';

  beforeEach(function () {
    sinon.stub(mailer, 'sendEmail').resolves();
  });

  describe('#sendOrganizationInvitationEmail', function () {
    const organizationName = 'Organization Name';
    const organizationInvitationId = 1;
    const code = 'ABCDEFGH01';

    it('should call sendEmail with from, to, template, organizationName', async function () {
      // given
      const locale = undefined;
      const template = 'test-organization-invitation-demand-template-id';

      // when
      await mailService.sendOrganizationInvitationEmail({
        email: userEmailAddress,
        organizationName,
        organizationInvitationId,
        code,
        locale,
      });

      // then
      const expectedOptions = {
        from: senderEmailAddress,
        to: userEmailAddress,
        template,
      };
      const options = mailer.sendEmail.firstCall.args[0];

      expect(options).to.includes(expectedOptions);
      expect(options.variables.organizationName).to.equal(organizationName);
    });

    context('according to tags', function () {
      context('When tags property is not provided', function () {
        it('should call mail provider with null tags', async function () {
          // given
          const tags = null;

          // when
          await mailService.sendOrganizationInvitationEmail({
            email: userEmailAddress,
            organizationName,
            organizationInvitationId,
            code,
            tags,
          });

          // then
          const actualTags = mailer.sendEmail.firstCall.args[0].tags;
          expect(actualTags).to.equal(tags);
        });
      });

      context('When tags property is provided', function () {
        it('should call mail provider with correct tags', async function () {
          // given
          const tags = ['JOIN_ORGA'];

          // when
          await mailService.sendOrganizationInvitationEmail({
            email: userEmailAddress,
            organizationName,
            organizationInvitationId,
            code,
            tags,
          });

          // then
          const actualTags = mailer.sendEmail.firstCall.args[0].tags;
          expect(actualTags).to.equal(tags);
        });
      });
    });

    context('according to locale', function () {
      context('should call sendEmail with localized variable options', function () {
        it(`when locale is ${FRENCH_SPOKEN}`, async function () {
          // when
          await mailService.sendOrganizationInvitationEmail({
            email: userEmailAddress,
            organizationName,
            organizationInvitationId,
            code,
            locale: FRENCH_SPOKEN,
          });

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('Pix Orga - Ne pas répondre');
          expect(options.subject).to.equal(mainTranslationsMapping.fr['organization-invitation-email'].subject);
          expect(options.variables).to.include({
            pixHomeName: 'pix.org',
            pixHomeUrl: 'https://pix.org/fr/',
            pixOrgaHomeUrl: 'https://orga.pix.org/?lang=fr',
            redirectionUrl: `https://orga.pix.org/rejoindre?invitationId=${organizationInvitationId}&code=${code}&lang=fr`,
            supportUrl: 'https://pix.org/fr/support',
            ...mainTranslationsMapping.fr['organization-invitation-email'].params,
          });
        });

        it(`when locale is ${FRENCH_FRANCE}`, async function () {
          // when
          await mailService.sendOrganizationInvitationEmail({
            email: userEmailAddress,
            organizationName,
            organizationInvitationId,
            code,
            locale: FRENCH_FRANCE,
          });

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('Pix Orga - Ne pas répondre');
          expect(options.subject).to.equal(mainTranslationsMapping.fr['organization-invitation-email'].subject);
          expect(options.variables).to.include({
            pixHomeName: 'pix.fr',
            pixHomeUrl: 'https://pix.fr',
            pixOrgaHomeUrl: 'https://orga.pix.fr/',
            redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
            supportUrl: 'https://pix.fr/support',
            ...mainTranslationsMapping.fr['organization-invitation-email'].params,
          });
        });

        it('when locale is undefined', async function () {
          // when
          await mailService.sendOrganizationInvitationEmail({
            email: userEmailAddress,
            organizationName,
            organizationInvitationId,
            code,
            locale: undefined,
          });

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('Pix Orga - Ne pas répondre');
          expect(options.subject).to.equal(mainTranslationsMapping.fr['organization-invitation-email'].subject);
          expect(options.variables).to.include({
            pixHomeName: 'pix.fr',
            pixHomeUrl: 'https://pix.fr',
            pixOrgaHomeUrl: 'https://orga.pix.fr/',
            redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
            supportUrl: 'https://pix.fr/support',
            ...mainTranslationsMapping.fr['organization-invitation-email'].params,
          });
        });

        it(`when locale is ${ENGLISH_SPOKEN}`, async function () {
          // when
          await mailService.sendOrganizationInvitationEmail({
            email: userEmailAddress,
            organizationName,
            organizationInvitationId,
            code,
            locale: ENGLISH_SPOKEN,
          });

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('Pix Orga - Noreply');
          expect(options.subject).to.equal(mainTranslationsMapping.en['organization-invitation-email'].subject);
          expect(options.variables).to.include({
            pixHomeName: 'pix.org',
            pixHomeUrl: 'https://pix.org/en/',
            pixOrgaHomeUrl: 'https://orga.pix.org/?lang=en',
            redirectionUrl: `https://orga.pix.org/rejoindre?invitationId=${organizationInvitationId}&code=${code}&lang=en`,
            supportUrl: 'https://pix.org/en/support',
            ...mainTranslationsMapping.en['organization-invitation-email'].params,
          });
        });
      });
    });
  });

  describe('#sendScoOrganizationInvitationEmail', function () {
    it('should call mail provider with pix-orga url, organization-invitation id, code, template and null tags', async function () {
      // given
      const organizationName = 'Organization SCO';
      const firstName = 'FirstName';
      const lastName = 'LastName';
      const organizationInvitationId = 1;
      const code = 'ABCDEFGH01';
      const pixOrgaUrl = 'https://orga.pix.fr';
      const expectedOptions = {
        from: senderEmailAddress,
        fromName: 'Pix Orga - Ne pas répondre',
        to: userEmailAddress,
        subject: 'Accès à votre espace Pix Orga',
        template: 'test-organization-invitation-sco-demand-template-id',
        variables: {
          organizationName,
          firstName,
          lastName,
          pixHomeName: 'pix.fr',
          pixHomeUrl: 'https://pix.fr',
          pixOrgaHomeUrl: pixOrgaUrl,
          locale: FRENCH_FRANCE,
          redirectionUrl: `${pixOrgaUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
        },
        tags: null,
      };

      // when
      await mailService.sendScoOrganizationInvitationEmail({
        email: userEmailAddress,
        organizationName,
        firstName,
        lastName,
        organizationInvitationId,
        code,
      });

      // then
      expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
    });
  });

  describe('#sendCertificationCenterInvitationEmail', function () {
    it('should send an email and set subject, sender, receiver in french as default', async function () {
      // given & when
      await mailService.sendCertificationCenterInvitationEmail({
        email: 'invited@example.net',
        certificationCenterName: 'Centre Pixou',
        certificationCenterInvitationId: 7,
        code: 'ABCDEFGH01',
        locale: undefined,
      });

      // then
      const sendEmailParameters = mailer.sendEmail.firstCall.args[0];

      expect(sendEmailParameters.subject).to.equal(
        mainTranslationsMapping.fr['certification-center-invitation-email'].subject,
      );
      expect(sendEmailParameters.from).to.equal(senderEmailAddress);
      expect(sendEmailParameters.fromName).to.equal('Pix Certif - Ne pas répondre');
      expect(sendEmailParameters.to).to.equal('invited@example.net');
      expect(sendEmailParameters.template).to.equal('test-certification-center-invitation-template-id');
      expect(sendEmailParameters.variables).to.include({
        certificationCenterName: 'Centre Pixou',
        pixHomeName: 'pix.fr',
        pixHomeUrl: 'https://pix.fr',
        pixCertifHomeUrl: 'https://certif.pix.fr/',
        redirectionUrl: `https://certif.pix.fr/rejoindre?invitationId=7&code=ABCDEFGH01`,
        supportUrl: 'https://pix.fr/support',
        ...mainTranslationsMapping.fr['certification-center-invitation-email'].params,
      });
    });

    context(`when locale is ${FRENCH_SPOKEN}`, function () {
      it('should call sendEmail with localized variable options', async function () {
        // given
        const locale = FRENCH_SPOKEN;

        // when
        await mailService.sendCertificationCenterInvitationEmail({
          email: 'invited@example.net',
          certificationCenterName: 'Centre Pixi',
          certificationCenterInvitationId: 7,
          code: 'AAABBBCCC7',
          locale,
        });

        // then
        const sendEmailParameters = mailer.sendEmail.firstCall.args[0];
        expect(sendEmailParameters.subject).to.equal(
          mainTranslationsMapping.fr['certification-center-invitation-email'].subject,
        );
        expect(sendEmailParameters.fromName).to.equal('Pix Certif - Ne pas répondre');
        expect(sendEmailParameters.variables).to.include({
          certificationCenterName: 'Centre Pixi',
          pixHomeName: 'pix.org',
          pixHomeUrl: 'https://pix.org/fr/',
          pixCertifHomeUrl: 'https://certif.pix.org/?lang=fr',
          redirectionUrl: `https://certif.pix.org/rejoindre?invitationId=7&code=AAABBBCCC7&lang=fr`,
          supportUrl: 'https://pix.org/fr/support',
          ...mainTranslationsMapping.fr['certification-center-invitation-email'].params,
        });
      });
    });

    context(`when locale is ${ENGLISH_SPOKEN}`, function () {
      it('should call sendEmail with localized variable options', async function () {
        // given
        const locale = ENGLISH_SPOKEN;

        // when
        await mailService.sendCertificationCenterInvitationEmail({
          email: 'invited@example.net',
          certificationCenterName: 'Centre Pixi',
          certificationCenterInvitationId: 777,
          code: 'LLLJJJVVV1',
          locale,
        });

        // then
        const sendEmailParameters = mailer.sendEmail.firstCall.args[0];
        expect(sendEmailParameters.subject).to.equal(
          mainTranslationsMapping.en['certification-center-invitation-email'].subject,
        );
        expect(sendEmailParameters.fromName).to.equal('Pix Certif - Noreply');
        expect(sendEmailParameters.variables).to.include({
          certificationCenterName: 'Centre Pixi',
          pixHomeName: 'pix.org',
          pixHomeUrl: 'https://pix.org/en/',
          pixCertifHomeUrl: 'https://certif.pix.org/?lang=en',
          redirectionUrl: `https://certif.pix.org/rejoindre?invitationId=777&code=LLLJJJVVV1&lang=en`,
          supportUrl: 'https://pix.org/en/support',
          ...mainTranslationsMapping.en['certification-center-invitation-email'].params,
        });
      });
    });
  });

  describe('#sendAccountRecoveryEmail', function () {
    it('calls sendEmail with from, to, template, tags', async function () {
      // given
      const translationsMapping = mainTranslationsMapping.fr['account-recovery-email'];

      const firstName = 'Carla';
      const temporaryKey = 'a temporary key';
      const email = 'carla@example.net';
      const redirectionUrl = `${config.domain.pixApp + config.domain.tldFr}/recuperer-mon-compte/${temporaryKey}`;

      // when
      await mailService.sendAccountRecoveryEmail({
        email,
        firstName,
        temporaryKey,
      });

      // then
      const expectedOptions = {
        from: senderEmailAddress,
        to: email,
        subject: 'Récupération de votre compte Pix',
        template: 'test-account-recovery-template-id',
        tags: ['SCO_ACCOUNT_RECOVERY'],
        variables: {
          firstName,
          redirectionUrl,
          homeName: 'pix.fr',
          ...translationsMapping.params,
        },
      };
      const options = mailer.sendEmail.firstCall.args[0];
      expect(options).to.deep.include(expectedOptions);
    });
  });

  describe('#sendVerificationCodeEmail', function () {
    it(`calls sendEmail with from, to, template, tags and locale ${FRENCH_SPOKEN}`, async function () {
      // given
      const translate = i18n.__;
      const userEmail = 'user@example.net';
      const code = '999999';

      // when
      await mailService.sendVerificationCodeEmail({
        code,
        email: userEmail,
        locale: FRENCH_SPOKEN,
        translate,
      });

      // then
      const options = mailer.sendEmail.firstCall.args[0];
      expect(options.subject).to.equal(translate('verification-code-email.subject', { code }));
      expect(options.fromName).to.equal('PIX - Ne pas répondre');
      expect(options.template).to.equal('test-email-verification-code-template-id');
      expect(options.variables).to.include({
        homeName: 'pix.org',
        homeUrl: 'https://pix.org/fr/',
        displayNationalLogo: false,
        code,
        ...mainTranslationsMapping.fr['verification-code-email'].body,
      });
    });

    it(`calls sendEmail with from, to, template, tags and locale ${FRENCH_FRANCE}`, async function () {
      // given
      const translate = i18n.__;
      const userEmail = 'user@example.net';
      const code = '999999';

      // when
      await mailService.sendVerificationCodeEmail({
        code,
        email: userEmail,
        locale: FRENCH_FRANCE,
        translate,
      });

      // then
      const options = mailer.sendEmail.firstCall.args[0];
      expect(options.subject).to.equal(translate('verification-code-email.subject', { code }));
      expect(options.fromName).to.equal('PIX - Ne pas répondre');
      expect(options.template).to.equal('test-email-verification-code-template-id');
      expect(options.variables).to.include({
        homeName: 'pix.fr',
        homeUrl: 'https://pix.fr',
        displayNationalLogo: true,
        code,
        ...mainTranslationsMapping.fr['verification-code-email'].body,
      });
    });

    it(`calls sendEmail with from, to, template, tags and locale ${ENGLISH_SPOKEN}`, async function () {
      // given
      const translate = i18n.__;
      const userEmail = 'user@example.net';
      const code = '999999';

      // when
      await mailService.sendVerificationCodeEmail({
        code,
        email: userEmail,
        locale: ENGLISH_SPOKEN,
        translate,
      });

      // then
      const options = mailer.sendEmail.firstCall.args[0];
      expect(options.subject).to.equal(
        translate({ phrase: 'verification-code-email.subject', locale: 'en' }, { code }),
      );
      expect(options.fromName).to.equal('PIX - Noreply');
      expect(options.template).to.equal('test-email-verification-code-template-id');
      expect(options.variables).to.include({
        homeName: 'pix.org',
        homeUrl: 'https://pix.org/en/',
        displayNationalLogo: false,
        code,
        ...mainTranslationsMapping.en['verification-code-email'].body,
      });
    });

    it(`calls sendEmail with from, to, template, tags and locale ${DUTCH_SPOKEN}`, async function () {
      // given
      const translate = i18n.__;
      const userEmail = 'user@example.net';
      const code = '999999';

      // when
      await mailService.sendVerificationCodeEmail({
        code,
        email: userEmail,
        locale: DUTCH_SPOKEN,
        translate,
      });

      // then
      const options = mailer.sendEmail.firstCall.args[0];
      expect(options.subject).to.equal(
        translate({ phrase: 'verification-code-email.subject', locale: 'nl' }, { code }),
      );
      expect(options.fromName).to.equal('PIX - Niet beantwoorden');
      expect(options.template).to.equal('test-email-verification-code-template-id');
      expect(options.variables).to.include({
        homeName: 'pix.org',
        homeUrl: 'https://pix.org/nl-be/',
        displayNationalLogo: false,
        code,
        ...mainTranslationsMapping.nl['verification-code-email'].body,
      });
    });

    it(`calls sendEmail with from, to, template, tags and locale ${SPANISH_SPOKEN}`, async function () {
      // given
      const translate = i18n.__;
      const userEmail = 'user@example.net';
      const code = '999999';

      // when
      await mailService.sendVerificationCodeEmail({
        code,
        email: userEmail,
        locale: SPANISH_SPOKEN,
        translate,
      });

      // then
      const options = mailer.sendEmail.firstCall.args[0];
      expect(options.subject).to.equal(
        translate({ phrase: 'verification-code-email.subject', locale: 'es' }, { code }),
      );
      expect(options.fromName).to.equal('PIX - No responder');
      expect(options.template).to.equal('test-email-verification-code-template-id');
      expect(options.variables).to.include({
        homeName: 'pix.org',
        homeUrl: 'https://pix.org/en/',
        displayNationalLogo: false,
        code,
        ...mainTranslationsMapping.es['verification-code-email'].body,
      });
    });
  });

  describe('#sendCpfEmail', function () {
    it(`should call sendEmail with the right options`, async function () {
      // given
      const email = 'user@example.net';
      const generatedFiles = Symbol('generatedFiles');

      // when
      await mailService.sendCpfEmail({
        email,
        generatedFiles,
      });

      // then
      expect(mailer.sendEmail).to.have.been.calledWithExactly({
        from: 'ne-pas-repondre@pix.fr',
        fromName: 'PIX - Ne pas répondre',
        to: email,
        template: mailer.cpfEmailTemplateId,
        variables: { generatedFiles },
      });
    });
  });

  describe('#sendNotificationToOrganizationMembersForTargetProfileDetached', function () {
    it(`should call sendEmail with the right options`, async function () {
      // given
      const email = 'user@example.net';
      const complementaryCertificationName = 'what a complementary';

      // when
      await mailService.sendNotificationToOrganizationMembersForTargetProfileDetached({
        email,
        complementaryCertificationName,
      });

      // then
      expect(mailer.sendEmail).to.have.been.calledWith({
        from: 'ne-pas-repondre@pix.fr',
        fromName: 'PIX - Ne pas répondre',
        to: email,
        template: mailer.targetProfileNotCertifiableTemplateId,
        variables: { complementaryCertificationName },
      });
    });
  });
});
