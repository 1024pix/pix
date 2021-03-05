const { sinon, expect } = require('../../../test-helper');

const mailService = require('../../../../lib/domain/services/mail-service');
const mailer = require('../../../../lib/infrastructure/mailers/mailer');
const tokenService = require('../../../../lib/domain/services/token-service');
const settings = require('../../../../lib/config');

const organizationInvitationTranslationsMapping = {
  'fr': require('../../../../translations/fr')['organization-invitation-email'],
  'en': require('../../../../translations/en')['organization-invitation-email'],
};

describe('Unit | Service | MailService', () => {

  const senderEmailAddress = 'ne-pas-repondre@pix.fr';
  const userEmailAddress = 'user@example.net';

  beforeEach(() => {
    sinon.stub(mailer, 'sendEmail').resolves();
  });

  describe('#sendAccountCreationEmail', () => {

    it('should use mailer to send an email with locale "fr-fr"', async () => {
      // given
      const locale = 'fr-fr';
      const domainFr = 'pix.fr';
      const expectedOptions = {
        from: senderEmailAddress,
        fromName: 'PIX - Ne pas répondre',
        to: userEmailAddress,
        subject: 'Votre compte Pix a bien été créé',
        template: 'test-account-creation-template-id',
        variables: {
          homeName: `${domainFr}`,
          homeUrl: `https://${domainFr}`,
          redirectionUrl: `https://app.${domainFr}/connexion`,
          locale,
        },
      };

      // when
      await mailService.sendAccountCreationEmail(userEmailAddress, locale);

      // then
      expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
    });

    it('should use mailer to send an email with redirectionUrl from parameters', async () => {
      // given
      const redirectionUrl = 'https://pix.fr';
      const locale = 'fr-fr';
      const domainFr = 'pix.fr';
      const expectedOptions = {
        from: senderEmailAddress,
        fromName: 'PIX - Ne pas répondre',
        to: userEmailAddress,
        subject: 'Votre compte Pix a bien été créé',
        template: 'test-account-creation-template-id',
        variables: {
          homeName: `${domainFr}`,
          homeUrl: `https://${domainFr}`,
          redirectionUrl,
          locale,
        },
      };

      // when
      await mailService.sendAccountCreationEmail(userEmailAddress, locale, redirectionUrl);

      // then
      expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
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

    context('when provided passwordResetDemandBaseUrl is not production', () => {

      it('should call mailer', async () => {
        // given
        const fakeTemporaryKey = 'token';
        const locale = 'fr-fr';
        const domainFr = 'pix.fr';

        const expectedOptions = {
          from: senderEmailAddress,
          fromName: 'PIX - Ne pas répondre',
          to: userEmailAddress,
          subject: 'Demande de réinitialisation de mot de passe PIX',
          template: 'test-password-reset-template-id',
          variables: {
            resetUrl: `https://app.${domainFr}/changer-mot-de-passe/${fakeTemporaryKey}`,
            homeName: `${domainFr}`,
            homeUrl: `https://${domainFr}`,
            locale,
          },
        };

        // when
        await mailService.sendResetPasswordDemandEmail(userEmailAddress, locale, fakeTemporaryKey);

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });

      it('should call mailer with locale fr', async () => {
        // given
        const fakeTemporaryKey = 'token';
        const locale = 'fr';
        const domainOrg = 'pix.org';

        const expectedOptions = {
          from: senderEmailAddress,
          fromName: 'PIX - Ne pas répondre',
          to: userEmailAddress,
          subject: 'Demande de réinitialisation de mot de passe PIX',
          template: 'test-password-reset-template-id',
          variables: {
            resetUrl: `https://app.${domainOrg}/changer-mot-de-passe/${fakeTemporaryKey}/?lang=fr`,
            homeName: `${domainOrg}`,
            homeUrl: `https://${domainOrg}/fr/`,
            locale,
          },
        };

        // when
        await mailService.sendResetPasswordDemandEmail(userEmailAddress, locale, fakeTemporaryKey);

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });

      it('should call mailer with locale en', async () => {
        // given
        const fakeTemporaryKey = 'token';
        const locale = 'en';
        const domainOrg = 'pix.org';

        const expectedOptions = {
          from: senderEmailAddress,
          fromName: 'PIX - Noreply',
          to: userEmailAddress,
          subject: 'Pix password reset request',
          template: 'test-password-reset-template-id',
          variables: {
            resetUrl: `https://app.${domainOrg}/changer-mot-de-passe/${fakeTemporaryKey}/?lang=en`,
            homeName: `${domainOrg}`,
            homeUrl: `https://${domainOrg}/en-gb/`,
            locale,
          },
        };

        // when
        await mailService.sendResetPasswordDemandEmail(userEmailAddress, locale, fakeTemporaryKey);

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
    });
  });

  describe('#sendOrganizationInvitationEmail', () => {

    const organizationName = 'Organization Name';
    const organizationInvitationId = 1;
    const code = 'ABCDEFGH01';
    const translationsMapping = organizationInvitationTranslationsMapping;

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

      context('should call sendEmail with localized variable options', () => {

        const testCases = [
          {
            locale: undefined,
            expected: {
              fromName: 'Pix Orga - Ne pas répondre',
              subject: 'Invitation à rejoindre Pix Orga',
              variables: {
                pixHomeName: 'pix.fr',
                pixHomeUrl: 'https://pix.fr',
                pixOrgaHomeUrl: 'https://orga.pix.fr',
                redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
                supportUrl: 'https://support.pix.fr/support/tickets/new',
                ...translationsMapping.fr,
              },
            },
          },
          {
            locale: 'fr',
            expected: {
              fromName: 'Pix Orga - Ne pas répondre',
              subject: 'Invitation à rejoindre Pix Orga',
              variables: {
                pixHomeName: 'pix.org',
                pixHomeUrl: 'https://pix.org',
                pixOrgaHomeUrl: 'https://orga.pix.org',
                redirectionUrl: `https://orga.pix.org/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
                supportUrl: 'https://support.pix.fr/support/tickets/new',
                ...translationsMapping.fr,
              },
            },
          },
          {
            locale: 'fr-fr',
            expected: {
              fromName: 'Pix Orga - Ne pas répondre',
              subject: 'Invitation à rejoindre Pix Orga',
              variables: {
                pixHomeName: 'pix.fr',
                pixHomeUrl: 'https://pix.fr',
                pixOrgaHomeUrl: 'https://orga.pix.fr',
                redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
                supportUrl: 'https://support.pix.fr/support/tickets/new',
                ...translationsMapping.fr,
              },
            },
          },
          {
            locale: 'en',
            expected: {
              fromName: 'Pix Orga - Noreply',
              subject: 'Invitation to join Pix Orga',
              variables: {
                pixHomeName: 'pix.org',
                pixHomeUrl: 'https://pix.org/en-gb/',
                pixOrgaHomeUrl: 'https://orga.pix.org?lang=en',
                redirectionUrl: `https://orga.pix.org/rejoindre?invitationId=${organizationInvitationId}&code=${code}&lang=en`,
                supportUrl: 'https://pix.org/en-gb/help-form',
                ...translationsMapping.en,
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
          locale: 'fr-fr',
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

});

