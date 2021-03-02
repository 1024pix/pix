const { sinon, expect } = require('../../../test-helper');

const mailService = require('../../../../lib/domain/services/mail-service');
const mailer = require('../../../../lib/infrastructure/mailers/mailer');
const tokenService = require('../../../../lib/domain/services/token-service');
const settings = require('../../../../lib/config');

const translatedTextsFr = require('../../../../translations/fr');
const translatedTextsEn = require('../../../../translations/en');

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

    let organizationInvitationEmailFr;
    let organizationInvitationEmailEn;

    let expectedOptions;

    beforeEach(() => {
      organizationInvitationEmailFr = translatedTextsFr['organization-invitation-email'];
      organizationInvitationEmailEn = translatedTextsEn['organization-invitation-email'];

      translatedTextsFr['organization-invitation-email'] = { title: 'Un titre' };
      translatedTextsEn['organization-invitation-email'] = { title: 'A title' };

      expectedOptions = {
        from: senderEmailAddress,
        fromName: 'Pix Orga - Ne pas répondre',
        to: userEmailAddress,
        subject: 'Invitation à rejoindre Pix Orga',
        template: 'test-organization-invitation-demand-template-id',
        variables: {
          organizationName,
          pixHomeName: 'pix.fr',
          pixHomeUrl: 'https://pix.fr',
          pixOrgaHomeUrl: 'https://orga.pix.fr',
          redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
          supportUrl: 'https://support.pix.fr/support/tickets/new',
          ...translatedTextsFr['organization-invitation-email'],
        },
        tags: null,
      };
    });

    afterEach(() => {
      translatedTextsFr['organization-invitation-email'] = organizationInvitationEmailFr;
      translatedTextsEn['organization-invitation-email'] = organizationInvitationEmailEn;
    });

    context('When tags property is not provided', () => {

      it('should call mail provider with null tags', async () => {
        // given
        expectedOptions.tags = null;

        // when
        await mailService.sendOrganizationInvitationEmail({
          email: userEmailAddress, organizationName, organizationInvitationId, code,
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
    });

    context('When tags property is provided', () => {

      it('should call mail provider with correct tags', async () => {
        // given
        const tags = ['JOIN_ORGA'];
        expectedOptions.tags = tags;

        // when
        await mailService.sendOrganizationInvitationEmail({
          email: userEmailAddress, organizationName, organizationInvitationId, code, tags,
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
    });

    context('When locale is fr', () => {

      const locale = 'fr';

      it('should call sendEmail with expected options', async () => {
        // given
        expectedOptions.variables = {
          organizationName,
          pixHomeName: 'pix.org',
          pixHomeUrl: 'https://pix.org',
          pixOrgaHomeUrl: 'https://orga.pix.org',
          redirectionUrl: `https://orga.pix.org/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
          supportUrl: 'https://support.pix.fr/support/tickets/new',
          ...translatedTextsFr['organization-invitation-email'],
        };

        // when
        await mailService.sendOrganizationInvitationEmail({
          email: userEmailAddress, organizationName, organizationInvitationId, code, locale,
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
    });

    context('When locale is fr-fr', () => {

      const locale = 'fr-fr';

      it('should call sendEmail with expected options', async () => {
        // given
        expectedOptions.variables = {
          organizationName,
          pixHomeName: 'pix.fr',
          pixHomeUrl: 'https://pix.fr',
          pixOrgaHomeUrl: 'https://orga.pix.fr',
          redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
          supportUrl: 'https://support.pix.fr/support/tickets/new',
          ...translatedTextsFr['organization-invitation-email'],
        };

        // when
        await mailService.sendOrganizationInvitationEmail({
          email: userEmailAddress, organizationName, organizationInvitationId, code, locale,
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
    });

    context('When locale is en', () => {

      const locale = 'en';

      it('should call sendEmail with expected options', async () => {
        // given
        expectedOptions.fromName = 'Pix Orga - Noreply';
        expectedOptions.subject = 'Invitation to join Pix Orga';
        expectedOptions.variables = {
          organizationName,
          pixHomeName: 'pix.org',
          pixHomeUrl: 'https://pix.org/en-gb/',
          pixOrgaHomeUrl: 'https://orga.pix.org?lang=en',
          redirectionUrl: `https://orga.pix.org/rejoindre?invitationId=${organizationInvitationId}&code=${code}&lang=en`,
          supportUrl: 'https://pix.org/en-gb/help-form',
          ...translatedTextsEn['organization-invitation-email'],
        };

        // when
        await mailService.sendOrganizationInvitationEmail({
          email: userEmailAddress, organizationName, organizationInvitationId, code, locale,
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
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

