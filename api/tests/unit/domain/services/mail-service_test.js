import { config as settings } from '../../../../lib/config.js';
import * as mailService from '../../../../lib/domain/services/mail-service.js';
import { LOCALE } from '../../../../src/shared/domain/constants.js';
import { tokenService } from '../../../../src/shared/domain/services/token-service.js';
import { urlBuilder } from '../../../../src/shared/infrastructure/utils/url-builder.js';
import { mailer } from '../../../../src/shared/mail/infrastructure/services/mailer.js';
import en from '../../../../translations/en.json' with { type: 'json' };
import fr from '../../../../translations/fr.json' with { type: 'json' };
import { es } from '../../../../translations/index.js';
import nl from '../../../../translations/nl.json' with { type: 'json' };
import { expect, sinon } from '../../../test-helper.js';
import { getI18n } from '../../../tooling/i18n/i18n.js';

const mainTranslationsMapping = {
  fr,
  en,
  nl,
  es,
};

const { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN, DUTCH_SPOKEN, SPANISH_SPOKEN } = LOCALE;

describe('Unit | Service | MailService', function () {
  const senderEmailAddress = 'ne-pas-repondre@pix.fr';
  const userEmailAddress = 'user@example.net';

  beforeEach(function () {
    sinon.stub(mailer, 'sendEmail').resolves();
  });

  describe('#sendAccountCreationEmail', function () {
    it('calls sendEmail with from, to, subject, template', async function () {
      // given
      const locale = undefined;
      const template = 'test-account-creation-template-id';
      const token = '00000000-0000-0000-0000-000000000000';
      const redirectionUrl = 'https://where-i-should.go';

      sinon.stub(urlBuilder, 'getEmailValidationUrl').returns('http://redirect.uri');

      const expectedOptions = {
        from: senderEmailAddress,
        to: userEmailAddress,
        subject: 'Votre compte Pix a bien été créé',
        template,
      };

      // when
      await mailService.sendAccountCreationEmail(userEmailAddress, locale, token, redirectionUrl);

      // then
      const options = mailer.sendEmail.firstCall.args[0];
      expect(options).to.include(expectedOptions);
      expect(urlBuilder.getEmailValidationUrl).to.have.been.calledWith({
        locale: 'fr-fr',
        redirectUri: redirectionUrl,
        token,
      });
    });

    context('according to redirectionUrl', function () {
      context('if redirectionUrl is provided', function () {
        it('calls sendEmail with provided value', async function () {
          // given
          const token = 'XXX';
          const redirectionUrl = 'https://pix.fr';
          const locale = FRENCH_FRANCE;
          const expectedParams = new URLSearchParams({ token, redirect_uri: redirectionUrl });

          // when
          await mailService.sendAccountCreationEmail(userEmailAddress, locale, token, redirectionUrl);

          // then
          const actualRedirectionUrl = mailer.sendEmail.firstCall.args[0].variables.redirectionUrl;
          expect(actualRedirectionUrl).to.equal(
            `https://app.pix.fr/api/users/validate-email?${expectedParams.toString()}`,
          );
        });
      });
    });

    context('according to locale', function () {
      context('call sendEmail with localized variable options', function () {
        it(`calls sendEmail with from, to, and locale ${FRENCH_SPOKEN} or undefined`, async function () {
          // given
          const locale = FRENCH_SPOKEN;
          const expectedParams = new URLSearchParams({ redirect_uri: 'https://app.pix.org/connexion/?lang=fr' });

          // when
          await mailService.sendAccountCreationEmail(userEmailAddress, locale);

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('PIX - Ne pas répondre');
          expect(options.variables).to.include({
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/fr/',
            helpdeskUrl: 'https://pix.org/fr/support',
            displayNationalLogo: false,
            redirectionUrl: `https://app.pix.org/api/users/validate-email?${expectedParams.toString()}`,
            ...mainTranslationsMapping.fr['pix-account-creation-email'].params,
          });
        });

        it(`calls sendEmail with from, to, template and locale ${FRENCH_FRANCE}`, async function () {
          // given
          const locale = FRENCH_FRANCE;
          const expectedParams = new URLSearchParams({ redirect_uri: 'https://app.pix.fr/connexion' });

          // when
          await mailService.sendAccountCreationEmail(userEmailAddress, locale);

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('PIX - Ne pas répondre');
          expect(options.variables).to.include({
            homeName: 'pix.fr',
            homeUrl: 'https://pix.fr',
            helpdeskUrl: 'https://pix.fr/support',
            displayNationalLogo: true,
            redirectionUrl: `https://app.pix.fr/api/users/validate-email?${expectedParams.toString()}`,
            ...mainTranslationsMapping.fr['pix-account-creation-email'].params,
          });
        });

        it(`calls sendEmail with from, to, template and locale ${ENGLISH_SPOKEN}`, async function () {
          // given
          const locale = ENGLISH_SPOKEN;
          const expectedParams = new URLSearchParams({ redirect_uri: 'https://app.pix.org/connexion/?lang=en' });

          // when
          await mailService.sendAccountCreationEmail(userEmailAddress, locale);

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('PIX - Noreply');
          expect(options.variables).to.include({
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/en-gb/',
            helpdeskUrl: 'https://pix.org/en/support',
            displayNationalLogo: false,
            redirectionUrl: `https://app.pix.org/api/users/validate-email?${expectedParams.toString()}`,
            ...mainTranslationsMapping.en['pix-account-creation-email'].params,
          });
        });

        it(`calls sendEmail with from, to, template and locale ${DUTCH_SPOKEN}`, async function () {
          // given
          const locale = DUTCH_SPOKEN;
          const expectedParams = new URLSearchParams({ redirect_uri: 'https://app.pix.org/connexion/?lang=nl' });

          // when
          await mailService.sendAccountCreationEmail(userEmailAddress, locale);

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('PIX - Niet beantwoorden');
          expect(options.variables).to.include({
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/nl-be/',
            helpdeskUrl: 'https://pix.org/nl-be/support',
            displayNationalLogo: false,
            redirectionUrl: `https://app.pix.org/api/users/validate-email?${expectedParams.toString()}`,
            ...mainTranslationsMapping.nl['pix-account-creation-email'].params,
          });
        });

        it(`calls sendEmail with from, to, template and locale ${SPANISH_SPOKEN}`, async function () {
          // given
          const locale = SPANISH_SPOKEN;
          const expectedParams = new URLSearchParams({ redirect_uri: 'https://app.pix.org/connexion/?lang=es' });

          // when
          await mailService.sendAccountCreationEmail(userEmailAddress, locale);

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('PIX - No contestar');
          expect(options.variables).to.include({
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/en-gb/',
            helpdeskUrl: 'https://pix.org/en/support',
            displayNationalLogo: false,
            redirectionUrl: `https://app.pix.org/api/users/validate-email?${expectedParams.toString()}`,
            ...mainTranslationsMapping.es['pix-account-creation-email'].params,
          });
        });
      });
    });
  });

  describe('#sendCertificationResultEmail', function () {
    it(`should call sendEmail with from, to, template, tags, ${FRENCH_FRANCE} and ${ENGLISH_SPOKEN} translations`, async function () {
      // given
      sinon.stub(settings.domain, 'pixApp').value('https://pix.app');
      const translate = getI18n().__;
      const sessionDate = '2020-10-03';
      const sessionId = '3';
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
            homeUrl: 'https://pix.org/en-gb/',
            link: `${link}?lang=en`,
          },
          sessionId,
          sessionDate: '03/10/2020',
          certificationCenterName,
        },
      });
    });
  });

  describe('#sendResetPasswordDemandEmail', function () {
    const from = senderEmailAddress;
    const to = userEmailAddress;
    const template = 'test-password-reset-template-id';
    const temporaryKey = 'token';

    context('according to locale', function () {
      it(`calls mailer with translated texts if locale is ${ENGLISH_SPOKEN}`, async function () {
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
            helpdeskURL: 'https://pix.org/en/support',
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

      it(`calls mailer with translated texts if locale is ${DUTCH_SPOKEN}`, async function () {
        // given
        const expectedOptions = {
          from,
          to,
          template,
          fromName: 'PIX - Niet beantwoorden',
          subject: mainTranslationsMapping.nl['reset-password-demand-email'].subject,
          variables: {
            locale: DUTCH_SPOKEN,
            ...mainTranslationsMapping.nl['reset-password-demand-email'].params,
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/nl-be/',
            resetUrl: `https://app.pix.org/changer-mot-de-passe/${temporaryKey}/?lang=nl`,
            helpdeskURL: 'https://pix.org/nl-be/support',
          },
        };

        // when
        await mailService.sendResetPasswordDemandEmail({
          email: userEmailAddress,
          locale: DUTCH_SPOKEN,
          temporaryKey,
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });

      it(`calls mailer with translated texts if locale is ${SPANISH_SPOKEN}`, async function () {
        // given
        const expectedOptions = {
          from,
          to,
          template,
          fromName: 'PIX - No contestar',
          subject: mainTranslationsMapping.es['reset-password-demand-email'].subject,
          variables: {
            locale: SPANISH_SPOKEN,
            ...mainTranslationsMapping.es['reset-password-demand-email'].params,
            homeName: 'pix.org',
            homeUrl: 'https://pix.org/en-gb/',
            resetUrl: `https://app.pix.org/changer-mot-de-passe/${temporaryKey}/?lang=es`,
            helpdeskURL: 'https://pix.org/en/support',
          },
        };

        // when
        await mailService.sendResetPasswordDemandEmail({
          email: userEmailAddress,
          locale: SPANISH_SPOKEN,
          temporaryKey,
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });

      it(`calls mailer with translated texts if locale is ${FRENCH_SPOKEN}`, async function () {
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
            helpdeskURL: 'https://pix.org/fr/support',
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

      it(`calls mailer with translated texts if locale is ${FRENCH_FRANCE}`, async function () {
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
            helpdeskURL: 'https://pix.fr/support',
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

      it(`calls mailer with fr-fr translated texts if locale is undefined`, async function () {
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
            helpdeskURL: 'https://pix.fr/support',
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
            pixHomeUrl: 'https://pix.org/en-gb/',
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
          pixHomeUrl: 'https://pix.org/en-gb/',
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
    it(`calls sendEmail with from, to, template, tags and locale ${FRENCH_SPOKEN}`, async function () {
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
        translate({ phrase: 'verification-code-email.subject', locale: 'en' }, { code }),
      );
      expect(options.fromName).to.equal('PIX - Noreply');
      expect(options.template).to.equal('test-email-verification-code-template-id');
      expect(options.variables).to.include({
        homeName: 'pix.org',
        homeUrl: 'https://pix.org/en-gb/',
        displayNationalLogo: false,
        code,
        ...mainTranslationsMapping.en['verification-code-email'].body,
      });
    });

    it(`calls sendEmail with from, to, template, tags and locale ${DUTCH_SPOKEN}`, async function () {
      // given
      const translate = getI18n().__;
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
      const translate = getI18n().__;
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
      expect(options.fromName).to.equal('PIX - No contestar');
      expect(options.template).to.equal('test-email-verification-code-template-id');
      expect(options.variables).to.include({
        homeName: 'pix.org',
        homeUrl: 'https://pix.org/en-gb/',
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
