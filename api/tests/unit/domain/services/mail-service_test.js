const { sinon, expect } = require('../../../test-helper');

const mailService = require('../../../../lib/domain/services/mail-service');
const mailer = require('../../../../lib/infrastructure/mailers/mailer');
const tokenService = require('../../../../lib/domain/services/token-service');
const settings = require('../../../../lib/config');

const mainTranslationsMapping = {
  fr: require('../../../../translations/fr'),
  en: require('../../../../translations/en'),
};

const {
  ENGLISH_SPOKEN,
  FRENCH_FRANCE,
  FRENCH_SPOKEN,
} = require('../../../../lib/domain/constants').LOCALE;

describe('Unit | Service | MailService', () => {

  const senderEmailAddress = 'ne-pas-repondre@pix.fr';
  const userEmailAddress = 'user@example.net';

  beforeEach(() => {
    sinon.stub(mailer, 'sendEmail').resolves();
  });

  describe('#sendAccountCreationEmail', () => {

    it('should call sendEmail with from, to, subject, template', async () => {
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

    context('according to redirectionUrl', () => {

      context('if redirectionUrl is provided', () => {

        it('should call sendEmail with provided value', async () => {
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

    context('according to locale', () => {

      const translationsMapping = {
        fr: mainTranslationsMapping.fr['pix-account-creation-email'],
        en: mainTranslationsMapping.en['pix-account-creation-email'],
      };

      context('should call sendEmail with localized variable options', () => {
        const testCases = [
          {
            locale: undefined,
            expected: {
              fromName: 'PIX - Ne pas répondre',
              subject: translationsMapping.fr.subject,
              variables: {
                homeName: 'pix.fr',
                homeUrl: 'https://pix.fr',
                helpdeskUrl: 'https://support.pix.fr/support/tickets/new',
                displayNationalLogo: true,
                redirectionUrl: 'https://app.pix.fr/connexion',
                ...translationsMapping.fr.params,
              },
            },
          },
          {
            locale: FRENCH_FRANCE,
            expected: {
              fromName: 'PIX - Ne pas répondre',
              subject: translationsMapping.fr.subject,
              variables: {
                homeName: 'pix.fr',
                homeUrl: 'https://pix.fr',
                helpdeskUrl: 'https://support.pix.fr/support/tickets/new',
                displayNationalLogo: true,
                redirectionUrl: 'https://app.pix.fr/connexion',
                ...translationsMapping.fr.params,
              },
            },
          },
          {
            locale: FRENCH_SPOKEN,
            expected: {
              fromName: 'PIX - Ne pas répondre',
              subject: translationsMapping.fr.subject,
              variables: {
                homeName: 'pix.org',
                homeUrl: 'https://pix.org/fr/',
                helpdeskUrl: 'https://pix.org/fr/formulaire-aide',
                displayNationalLogo: false,
                redirectionUrl: 'https://app.pix.org/connexion/?lang=fr',
                ...translationsMapping.fr.params,
              },
            },
          },
          {
            locale: ENGLISH_SPOKEN,
            expected: {
              fromName: 'PIX - Noreply',
              subject: translationsMapping.en.subject,
              variables: {
                homeName: 'pix.org',
                homeUrl: 'https://pix.org/en-gb/',
                helpdeskUrl: 'https://pix.org/en-gb/help-form',
                displayNationalLogo: false,
                redirectionUrl: 'https://app.pix.org/connexion/?lang=en',
                ...translationsMapping.en.params,
              },
            },
          },
        ];

        testCases.forEach((testCase) => {
          it(`when locale is ${testCase.locale}`, async () => {
            // when
            await mailService.sendAccountCreationEmail(userEmailAddress, testCase.locale);

            // then
            const options = mailer.sendEmail.firstCall.args[0];
            expect(options.fromName).to.equal(testCase.expected.fromName);
            expect(options.variables).to.include(testCase.expected.variables);
          });
        });
      });
    });
  });

  describe('#sendCertificationResultEmail', () => {

    it('should use mailer to send an email with given options', async () => {
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

  describe('#sendResetPasswordDemandEmail', () => {

    const from = senderEmailAddress;
    const to = userEmailAddress;
    const template = 'test-password-reset-template-id';
    const temporaryKey = 'token';

    const translationsMapping = {
      fr: mainTranslationsMapping.fr['reset-password-demand-email'],
      en: mainTranslationsMapping.en['reset-password-demand-email'],
    };

    context('according to locale', () => {

      const testCases = [
        {
          locale: undefined,
          expectedTranslationLanguage: FRENCH_SPOKEN,
          expectedOptions: {
            from,
            to,
            template,
            fromName: 'PIX - Ne pas répondre',
            subject: translationsMapping.fr.subject,
            variables: {
              locale: FRENCH_FRANCE,
              ...translationsMapping.fr.params,
              homeName: 'pix.fr',
              homeUrl: 'https://pix.fr',
              resetUrl: `https://app.pix.fr/changer-mot-de-passe/${temporaryKey}`,
              helpdeskURL: 'https://support.pix.fr/support/tickets/new',
            },
          },
        },
        {
          locale: FRENCH_FRANCE,
          expectedTranslationLanguage: FRENCH_SPOKEN,
          expectedOptions: {
            from,
            to,
            template,
            fromName: 'PIX - Ne pas répondre',
            subject: translationsMapping.fr.subject,
            variables: {
              locale: FRENCH_FRANCE,
              ...translationsMapping.fr.params,
              homeName: 'pix.fr',
              homeUrl: 'https://pix.fr',
              resetUrl: `https://app.pix.fr/changer-mot-de-passe/${temporaryKey}`,
              helpdeskURL: 'https://support.pix.fr/support/tickets/new',
            },
          },
        },
        {
          locale: FRENCH_SPOKEN,
          expectedTranslationLanguage: FRENCH_SPOKEN,
          expectedOptions: {
            from,
            to,
            template,
            fromName: 'PIX - Ne pas répondre',
            subject: translationsMapping.fr.subject,
            variables: {
              locale: FRENCH_SPOKEN,
              ...translationsMapping.fr.params,
              homeName: 'pix.org',
              homeUrl: 'https://pix.org/fr/',
              resetUrl: `https://app.pix.org/changer-mot-de-passe/${temporaryKey}/?lang=fr`,
              helpdeskURL: 'https://pix.org/fr/formulaire-aide',
            },
          },
        },
        {
          locale: ENGLISH_SPOKEN,
          expectedTranslationLanguage: ENGLISH_SPOKEN,
          expectedOptions: {
            from,
            to,
            template,
            fromName: 'PIX - Noreply',
            subject: translationsMapping.en.subject,
            variables: {
              locale: ENGLISH_SPOKEN,
              ...translationsMapping.en.params,
              homeName: 'pix.org',
              homeUrl: 'https://pix.org/en-gb/',
              resetUrl: `https://app.pix.org/changer-mot-de-passe/${temporaryKey}/?lang=en`,
              helpdeskURL: 'https://pix.org/en-gb/help-form',
            },
          },
        },
      ];

      testCases.forEach((testCase) => {
        it(`should call mailer with ${testCase.expectedTranslationLanguage} translated texts if locale is ${testCase.locale}`, async () => {
          // when
          await mailService.sendResetPasswordDemandEmail({
            email: userEmailAddress,
            locale: testCase.locale,
            temporaryKey,
          });

          // then
          expect(mailer.sendEmail).to.have.been.calledWithExactly(testCase.expectedOptions);
        });
      });
    });
  });

  describe('#sendOrganizationInvitationEmail', () => {

    const organizationName = 'Organization Name';
    const organizationInvitationId = 1;
    const code = 'ABCDEFGH01';

    it('should call sendEmail with from, to, organizationName', async () => {
      // given
      const locale = undefined;

      // when
      await mailService.sendOrganizationInvitationEmail({
        email: userEmailAddress, organizationName, organizationInvitationId, code, locale,
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

    context('according to tags', () => {

      context('When tags property is not provided', () => {

        it('should call mail provider with null tags', async () => {
          // given
          const tags = null;

          // when
          await mailService.sendOrganizationInvitationEmail({
            email: userEmailAddress, organizationName, organizationInvitationId, code, tags,
          });

          // then
          const actualTags = mailer.sendEmail.firstCall.args[0].tags;
          expect(actualTags).to.equal(tags);
        });
      });

      context('When tags property is provided', () => {

        it('should call mail provider with correct tags', async () => {
          // given
          const tags = ['JOIN_ORGA'];

          // when
          await mailService.sendOrganizationInvitationEmail({
            email: userEmailAddress, organizationName, organizationInvitationId, code, tags,
          });

          // then
          const actualTags = mailer.sendEmail.firstCall.args[0].tags;
          expect(actualTags).to.equal(tags);
        });
      });
    });

    context('according to locale', () => {

      const translationsMapping = {
        'fr': mainTranslationsMapping.fr['organization-invitation-email'],
        'en': mainTranslationsMapping.en['organization-invitation-email'],
      };

      context('should call sendEmail with localized variable options', () => {

        const testCases = [
          {
            locale: undefined,
            expected: {
              fromName: 'Pix Orga - Ne pas répondre',
              subject: translationsMapping.fr.subject,
              variables: {
                pixHomeName: 'pix.fr',
                pixHomeUrl: 'https://pix.fr',
                pixOrgaHomeUrl: 'https://orga.pix.fr',
                redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
                supportUrl: 'https://support.pix.fr/support/tickets/new',
                ...translationsMapping.fr.params,
              },
            },
          },
          {
            locale: FRENCH_SPOKEN,
            expected: {
              fromName: 'Pix Orga - Ne pas répondre',
              subject: translationsMapping.fr.subject,
              variables: {
                pixHomeName: 'pix.org',
                pixHomeUrl: 'https://pix.org',
                pixOrgaHomeUrl: 'https://orga.pix.org',
                redirectionUrl: `https://orga.pix.org/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
                supportUrl: 'https://pix.org/fr/formulaire-aide',
                ...translationsMapping.fr.params,
              },
            },
          },
          {
            locale: FRENCH_FRANCE,
            expected: {
              fromName: 'Pix Orga - Ne pas répondre',
              subject: translationsMapping.fr.subject,
              variables: {
                pixHomeName: 'pix.fr',
                pixHomeUrl: 'https://pix.fr',
                pixOrgaHomeUrl: 'https://orga.pix.fr',
                redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
                supportUrl: 'https://support.pix.fr/support/tickets/new',
                ...translationsMapping.fr.params,
              },
            },
          },
          {
            locale: ENGLISH_SPOKEN,
            expected: {
              fromName: 'Pix Orga - Noreply',
              subject: translationsMapping.en.subject,
              variables: {
                pixHomeName: 'pix.org',
                pixHomeUrl: 'https://pix.org/en-gb/',
                pixOrgaHomeUrl: 'https://orga.pix.org?lang=en',
                redirectionUrl: `https://orga.pix.org/rejoindre?invitationId=${organizationInvitationId}&code=${code}&lang=en`,
                supportUrl: 'https://pix.org/en-gb/help-form',
                ...translationsMapping.en.params,
              },
            },
          },
        ];

        testCases.forEach((testCase) => {
          it(`when locale is ${testCase.locale}`, async () => {
            // when
            await mailService.sendOrganizationInvitationEmail({
              email: userEmailAddress, organizationName, organizationInvitationId, code, locale: testCase.locale,
            });

            // then
            const options = mailer.sendEmail.firstCall.args[0];
            expect(options.fromName).to.equal(testCase.expected.fromName);
            expect(options.subject).to.equal(testCase.expected.subject);
            expect(options.variables).to.include(testCase.expected.variables);
          });
        });
      });
    });
  });

  describe('#sendScoOrganizationInvitationEmail', () => {

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

    it('should call mail provider with pix-orga url, organization-invitation id, code and null tags', async () => {
      // given
      const expectedOptions = {
        from: senderEmailAddress,
        fromName,
        to: userEmailAddress,
        subject, template,
        variables: {
          organizationName,
          firstName, lastName,
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
        firstName, lastName,
        organizationInvitationId, code,
      });

      // then
      expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
    });
  });

  describe('#notifyEmailChange', () => {

    it('should call sendEmail with from, to, template, tags', async () => {

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

    context('according to locale', () => {

      const translationsMapping = {
        'fr': mainTranslationsMapping.fr['email-change-email'],
        'en': mainTranslationsMapping.en['email-change-email'],
      };

      context('should call sendEmail with localized variable options', () => {

        const testCases = [
          {
            locale: FRENCH_SPOKEN,
            expected: {
              subject: translationsMapping.fr.subject,
              variables: {
                homeName: 'pix.org',
                homeUrl: 'https://pix.org/fr/',
                displayNationalLogo: false,
                ...translationsMapping.fr.body },
            },
          },
          {
            locale: FRENCH_FRANCE,
            expected: {
              subject: translationsMapping.fr.subject,
              variables: {
                homeName: 'pix.fr',
                homeUrl: 'https://pix.fr',
                displayNationalLogo: true,
                ...translationsMapping.fr.body },
            },
          },
          {
            locale: ENGLISH_SPOKEN,
            expected: {
              subject: translationsMapping.en.subject,
              variables: {
                homeName: 'pix.org',
                homeUrl: 'https://pix.org/en-gb/',
                displayNationalLogo: false,
                ...translationsMapping.en.body },
            },
          },
        ];

        testCases.forEach((testCase) => {
          it(`when locale is ${testCase.locale}`, async () => {

            // when
            await mailService.notifyEmailChange({ email: userEmailAddress, locale: testCase.locale });

            // then
            const options = mailer.sendEmail.firstCall.args[0];
            expect(options.subject).to.equal(testCase.expected.subject);
            expect(options.variables).to.include(testCase.expected.variables);
          });
        });

      });

    });

  });

});
