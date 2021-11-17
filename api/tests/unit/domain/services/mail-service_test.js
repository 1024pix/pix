const { sinon, expect } = require('../../../test-helper');

const mailService = require('../../../../lib/domain/services/mail-service');
const mailer = require('../../../../lib/infrastructure/mailers/mailer');
const tokenService = require('../../../../lib/domain/services/token-service');
const settings = require('../../../../lib/config');
const { getI18n } = require('../../../tooling/i18n/i18n');

const mainTranslationsMapping = {
  fr: require('../../../../translations/fr'),
  en: require('../../../../translations/en'),
};

const { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Unit | Service | MailService', function () {
  const senderEmailAddress = 'ne-pas-repondre@pix.fr';
  const userEmailAddress = 'user@example.net';

  beforeEach(function () {
    sinon.stub(mailer, 'sendEmail').resolves();
  });

  describe('#sendAccountCreationEmail', function () {
    it('should call sendEmail with from, to, subject, template', async function () {
      // given
      const locale = undefined;

      // given
      const expectedOptions = {
        from: senderEmailAddress,
        to: userEmailAddress,
        subject: 'Votre compte Pix a bien été créé',
        template: 'test-account-creation-template-id',
      };

      // when
      await mailService.sendAccountCreationEmail(userEmailAddress, locale);

      // then
      const options = mailer.sendEmail.firstCall.args[0];
      expect(options).to.include(expectedOptions);
    });

    context('according to redirectionUrl', function () {
      context('if redirectionUrl is provided', function () {
        it('should call sendEmail with provided value', async function () {
          // given
          const redirectionUrl = 'https://pix.fr';
          const locale = FRENCH_FRANCE;

          // when
          await mailService.sendAccountCreationEmail(userEmailAddress, locale, redirectionUrl);

          // then
          const actualRedirectionUrl = mailer.sendEmail.firstCall.args[0].variables.redirectionUrl;
          expect(actualRedirectionUrl).to.equal(redirectionUrl);
        });
      });
    });

    context('according to locale', function () {
      context('should call sendEmail with localized variable options', function () {
        it(`should call sendEmail with from, to, template and locale ${FRENCH_SPOKEN} or undefined`, async function () {
          // given
          const locale = FRENCH_SPOKEN;

          // when
          await mailService.sendAccountCreationEmail(userEmailAddress, locale);

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('PIX - Ne pas répondre');
          expect(options.variables).to.include({
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/fr/',
            helpdeskUrl: 'https://support.pix.org',
            displayNationalLogo: false,
            redirectionUrl: 'https://app.pix.org/connexion/?lang=fr',
            ...mainTranslationsMapping.fr['pix-account-creation-email'].params,
          });
        });
        it(`should call sendEmail with from, to, template and locale ${FRENCH_FRANCE}`, async function () {
          // given
          const locale = FRENCH_FRANCE;

          // when
          await mailService.sendAccountCreationEmail(userEmailAddress, locale);

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('PIX - Ne pas répondre');
          expect(options.variables).to.include({
            homeName: 'pix.fr',
            homeUrl: 'https://pix.fr',
            helpdeskUrl: 'https://support.pix.fr',
            displayNationalLogo: true,
            redirectionUrl: 'https://app.pix.fr/connexion',
            ...mainTranslationsMapping.fr['pix-account-creation-email'].params,
          });
        });
        it(`should call sendEmail with from, to, template and locale ${ENGLISH_SPOKEN}`, async function () {
          // given
          const locale = ENGLISH_SPOKEN;

          // when
          await mailService.sendAccountCreationEmail(userEmailAddress, locale);

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('PIX - Noreply');
          expect(options.variables).to.include({
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/en-gb/',
            helpdeskUrl: 'https://support.pix.org/en/support/home',
            displayNationalLogo: false,
            redirectionUrl: 'https://app.pix.org/connexion/?lang=en',
            ...mainTranslationsMapping.en['pix-account-creation-email'].params,
          });
        });
      });
    });
  });

  describe('#sendCertificationResultEmail', function () {
    it('should use mailer to send an email with given options', async function () {
      // given
      sinon.stub(settings.domain, 'pixApp').value('https://pix.app');
      const sessionDate = '2020-10-03';
      const sessionId = '3';
      const certificationCenterName = 'Vincennes';
      const resultRecipientEmail = 'email1@example.net';
      const daysBeforeExpiration = 30;
      const tokenServiceStub = sinon.stub(tokenService, 'createCertificationResultsByRecipientEmailLinkToken');
      tokenServiceStub.withArgs({ sessionId, resultRecipientEmail, daysBeforeExpiration }).returns('token-1');
      const link = 'https://pix.app.org/api/sessions/download-results/token-1';
      const expectedOptions = {
        from: senderEmailAddress,
        fromName: 'PIX - Ne pas répondre',
        to: userEmailAddress,
        template: 'test-certification-result-template-id',
        variables: {
          link,
          sessionId,
          certificationCenterName,
          sessionDate: '03/10/2020',
        },
      };

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
      expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
    });
  });

  describe('#sendResetPasswordDemandEmail', function () {
    const from = senderEmailAddress;
    const to = userEmailAddress;
    const template = 'test-password-reset-template-id';
    const temporaryKey = 'token';

    context('according to locale', function () {
      it(`should call mailer with translated texts if locale is ${ENGLISH_SPOKEN}`, async function () {
        // given
        const expectedOptions = {
          from,
          to,
          template,
          fromName: 'PIX - Noreply',
          subject: mainTranslationsMapping.en['reset-password-demand-email'].subject,
          variables: {
            locale: ENGLISH_SPOKEN,
            ...mainTranslationsMapping.en['reset-password-demand-email'].params,
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/en-gb/',
            resetUrl: `https://app.pix.org/changer-mot-de-passe/${temporaryKey}/?lang=en`,
            helpdeskURL: 'https://support.pix.org/en/support/home',
          },
        };

        // when
        await mailService.sendResetPasswordDemandEmail({
          email: userEmailAddress,
          locale: ENGLISH_SPOKEN,
          temporaryKey,
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
      it(`should call mailer with translated texts if locale is ${FRENCH_SPOKEN}`, async function () {
        // given
        const expectedOptions = {
          from,
          to,
          template,
          fromName: 'PIX - Ne pas répondre',
          subject: mainTranslationsMapping.fr['reset-password-demand-email'].subject,
          variables: {
            locale: FRENCH_SPOKEN,
            ...mainTranslationsMapping.fr['reset-password-demand-email'].params,
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/fr/',
            resetUrl: `https://app.pix.org/changer-mot-de-passe/${temporaryKey}/?lang=fr`,
            helpdeskURL: 'https://support.pix.org',
          },
        };

        // when
        await mailService.sendResetPasswordDemandEmail({
          email: userEmailAddress,
          locale: FRENCH_SPOKEN,
          temporaryKey,
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
      it(`should call mailer with translated texts if locale is ${FRENCH_FRANCE}`, async function () {
        // given
        const expectedOptions = {
          from,
          to,
          template,
          fromName: 'PIX - Ne pas répondre',
          subject: mainTranslationsMapping.fr['reset-password-demand-email'].subject,
          variables: {
            locale: FRENCH_FRANCE,
            ...mainTranslationsMapping.fr['reset-password-demand-email'].params,
            homeName: 'pix.fr',
            homeUrl: 'https://pix.fr',
            resetUrl: `https://app.pix.fr/changer-mot-de-passe/${temporaryKey}`,
            helpdeskURL: 'https://support.pix.fr',
          },
        };

        // when
        await mailService.sendResetPasswordDemandEmail({
          email: userEmailAddress,
          locale: FRENCH_FRANCE,
          temporaryKey,
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
      it(`should call mailer with fr-fr translated texts if locale is undefined`, async function () {
        // given
        const expectedOptions = {
          from,
          to,
          template,
          fromName: 'PIX - Ne pas répondre',
          subject: mainTranslationsMapping.fr['reset-password-demand-email'].subject,
          variables: {
            locale: FRENCH_FRANCE,
            ...mainTranslationsMapping.fr['reset-password-demand-email'].params,
            homeName: 'pix.fr',
            homeUrl: 'https://pix.fr',
            resetUrl: `https://app.pix.fr/changer-mot-de-passe/${temporaryKey}`,
            helpdeskURL: 'https://support.pix.fr',
          },
        };

        // when
        await mailService.sendResetPasswordDemandEmail({
          email: userEmailAddress,
          locale: undefined,
          temporaryKey,
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
    });
  });

  describe('#sendOrganizationInvitationEmail', function () {
    const organizationName = 'Organization Name';
    const organizationInvitationId = 1;
    const code = 'ABCDEFGH01';

    it('should call sendEmail with from, to, organizationName', async function () {
      // given
      const locale = undefined;

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
        variables: {
          organizationName,
        },
      };
      const options = mailer.sendEmail.firstCall.args[0];

      expect(options.from).to.equal(expectedOptions.from);
      expect(options.to).to.equal(expectedOptions.to);
      expect(options.variables.organizationName).to.equal(expectedOptions.variables.organizationName);
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
            pixHomeUrl: 'https://pix.org',
            pixOrgaHomeUrl: 'https://orga.pix.org',
            redirectionUrl: `https://orga.pix.org/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
            supportUrl: 'https://support.pix.org',
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
            pixOrgaHomeUrl: 'https://orga.pix.fr',
            redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
            supportUrl: 'https://support.pix.fr',
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
            pixOrgaHomeUrl: 'https://orga.pix.fr',
            redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
            supportUrl: 'https://support.pix.fr',
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
            pixHomeUrl: 'https://pix.org/en-gb/',
            pixOrgaHomeUrl: 'https://orga.pix.org?lang=en',
            redirectionUrl: `https://orga.pix.org/rejoindre?invitationId=${organizationInvitationId}&code=${code}&lang=en`,
            supportUrl: 'https://support.pix.org/en/support/home',
            ...mainTranslationsMapping.en['organization-invitation-email'].params,
          });
        });
      });
    });
  });

  describe('#sendScoOrganizationInvitationEmail', function () {
    const fromName = 'Pix Orga - Ne pas répondre';

    const subject = 'Accès à votre espace Pix Orga';
    const template = 'test-organization-invitation-sco-demand-template-id';

    const organizationName = 'Organization SCO';
    const firstName = 'FirstName';
    const lastName = 'LastName';
    const pixHomeName = 'pix.fr';
    const pixHomeUrl = 'https://pix.fr';
    const pixOrgaUrl = 'https://orga.pix.fr';
    const organizationInvitationId = 1;
    const code = 'ABCDEFGH01';

    it('should call mail provider with pix-orga url, organization-invitation id, code and null tags', async function () {
      // given
      const expectedOptions = {
        from: senderEmailAddress,
        fromName,
        to: userEmailAddress,
        subject,
        template,
        variables: {
          organizationName,
          firstName,
          lastName,
          pixHomeName,
          pixHomeUrl,
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

  describe('#notifyEmailChange', function () {
    it('should call sendEmail with from, to, template, tags', async function () {
      // given
      const locale = FRENCH_FRANCE;
      const expectedOptions = {
        from: senderEmailAddress,
        to: userEmailAddress,
        subject: 'Vous avez changé votre adresse e-mail',
        template: 'test-email-change-template-id',
        tags: ['EMAIL_CHANGE'],
      };

      // when
      await mailService.notifyEmailChange({ email: userEmailAddress, locale });

      // then
      const options = mailer.sendEmail.firstCall.args[0];
      expect(options).to.deep.include(expectedOptions);
    });

    context('according to locale', function () {
      context('should call sendEmail with localized variable options', function () {
        it(`when locale is ${FRENCH_SPOKEN}`, async function () {
          // when
          await mailService.notifyEmailChange({ email: userEmailAddress, locale: FRENCH_SPOKEN });

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.subject).to.equal(mainTranslationsMapping.fr['email-change-email'].subject);
          expect(options.variables).to.include({
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/fr/',
            displayNationalLogo: false,
            ...mainTranslationsMapping.fr['email-change-email'].body,
          });
        });
        it(`when locale is ${FRENCH_FRANCE}`, async function () {
          // when
          await mailService.notifyEmailChange({ email: userEmailAddress, locale: FRENCH_FRANCE });

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.subject).to.equal(mainTranslationsMapping.fr['email-change-email'].subject);
          expect(options.variables).to.include({
            homeName: 'pix.fr',
            homeUrl: 'https://pix.fr',
            displayNationalLogo: true,
            ...mainTranslationsMapping.fr['email-change-email'].body,
          });
        });
        it(`when locale is ${ENGLISH_SPOKEN}`, async function () {
          // when
          await mailService.notifyEmailChange({ email: userEmailAddress, locale: ENGLISH_SPOKEN });

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.subject).to.equal(mainTranslationsMapping.en['email-change-email'].subject);
          expect(options.variables).to.include({
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/en-gb/',
            displayNationalLogo: false,
            ...mainTranslationsMapping.en['email-change-email'].body,
          });
        });
      });
    });
  });

  describe('#sendAccountRecoveryEmail', function () {
    it('should call sendEmail with from, to, template, tags', async function () {
      // given
      const translationsMapping = mainTranslationsMapping.fr['account-recovery-email'];

      const firstName = 'Carla';
      const temporaryKey = 'a temporary key';
      const email = 'carla@example.net';
      const redirectionUrl = `https://app.pix.fr/recuperer-mon-compte/${temporaryKey}`;

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
    it(`should call sendEmail with from, to, template, tags and locale ${FRENCH_SPOKEN}`, async function () {
      // given
      const translate = getI18n().__;
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
      expect(options.variables).to.include({
        homeName: 'pix.org',
        homeUrl: 'https://pix.org/fr/',
        displayNationalLogo: false,
        code,
        ...mainTranslationsMapping.fr['verification-code-email'].body,
      });
    });

    it(`should call sendEmail with from, to, template, tags and locale ${FRENCH_FRANCE}`, async function () {
      // given
      const translate = getI18n().__;
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
      expect(options.variables).to.include({
        homeName: 'pix.fr',
        homeUrl: 'https://pix.fr',
        displayNationalLogo: true,
        code,
        ...mainTranslationsMapping.fr['verification-code-email'].body,
      });
    });

    it(`should call sendEmail with from, to, template, tags and locale ${ENGLISH_SPOKEN}`, async function () {
      // given
      const translate = getI18n().__;
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
        translate({ phrase: 'verification-code-email.subject', locale: 'en' }, { code })
      );
      expect(options.variables).to.include({
        homeName: 'pix.org',
        homeUrl: 'https://pix.org/en-gb/',
        displayNationalLogo: false,
        code,
        ...mainTranslationsMapping.en['verification-code-email'].body,
      });
    });
  });
});
