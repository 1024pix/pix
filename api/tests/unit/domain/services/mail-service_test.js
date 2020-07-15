const { sinon, expect } = require('../../../test-helper');

const mailService = require('../../../../lib/domain/services/mail-service');
const mailer = require('../../../../lib/infrastructure/mailers/mailer');

describe('Unit | Service | MailService', () => {

  const senderEmailAddress = 'ne-pas-repondre@pix.fr';
  const userEmailAddress = 'user@example.net';

  beforeEach(() => {
    sinon.stub(mailer, 'sendEmail').resolves();
  });

  describe('#sendAccountCreationEmail', () => {

    it('should use mailer to send an email with locale', async () => {
      // given
      const locale = 'fr-fr';
      const domainFr = 'pix.fr';
      const expectedOptions = {
        from: senderEmailAddress,
        fromName: 'PIX - Ne pas répondre',
        to: userEmailAddress,
        subject: 'Création de votre compte PIX',
        template: 'test-account-creation-template-id',
        variables: {
          homeName: `${domainFr}`,
          homeUrl: `https://${domainFr}`,
          redirectionUrl: `https://app.${domainFr}/connexion`,
          locale
        }
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
        subject: 'Création de votre compte PIX',
        template: 'test-account-creation-template-id',
        variables: {
          homeName: `${domainFr}`,
          homeUrl: `https://${domainFr}`,
          redirectionUrl,
          locale
        }
      };

      // when
      await mailService.sendAccountCreationEmail(userEmailAddress, locale, redirectionUrl);

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
            locale
          }
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
            resetUrl: `https://app.${domainOrg}/changer-mot-de-passe/${fakeTemporaryKey}`,
            homeName: `${domainOrg}`,
            homeUrl: `https://${domainOrg}`,
            locale
          }
        };

        // when
        await mailService.sendResetPasswordDemandEmail(userEmailAddress, locale, fakeTemporaryKey);

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
    });
  });

  describe('#sendOrganizationInvitationEmail', () => {

    const fromName = 'Pix Orga - Ne pas répondre';

    const subject = 'Invitation à rejoindre Pix Orga';
    const template = 'test-organization-invitation-demand-template-id';

    const organizationName = 'Organization Name';
    const pixHomeName = 'pix.fr';
    const pixHomeUrl = 'https://pix.fr';
    const pixOrgaUrl = 'https://orga.pix.fr';
    const organizationInvitationId = 1;
    const code = 'ABCDEFGH01';

    context('When tags property is not provided', () => {

      it('should call mail provider with pix-orga url, organization-invitation id, code and null tags', async () => {
        // given
        const expectedOptions = {
          from: senderEmailAddress,
          fromName,
          to: userEmailAddress,
          subject, template,
          variables: {
            organizationName,
            pixHomeName,
            pixHomeUrl,
            pixOrgaHomeUrl: pixOrgaUrl,
            locale: 'fr-fr',
            redirectionUrl: `${pixOrgaUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`
          },
          tags: null
        };

        // when
        await mailService.sendOrganizationInvitationEmail({
          email: userEmailAddress, organizationName, organizationInvitationId, code
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });

      it('should use locale pass in paramaters to construct url', async () => {
        // given
        const locale = 'fr';
        const pixHomeName = 'pix.org';
        const pixHomeUrl = 'https://pix.org';
        const pixOrgaUrl = 'https://orga.pix.org';
        const expectedOptions = {
          from: senderEmailAddress,
          fromName,
          to: userEmailAddress,
          subject, template,
          variables: {
            organizationName,
            pixHomeName,
            pixHomeUrl,
            pixOrgaHomeUrl: pixOrgaUrl,
            locale: 'fr',
            redirectionUrl: `${pixOrgaUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`
          },
          tags: null
        };

        // when
        await mailService.sendOrganizationInvitationEmail({
          email: userEmailAddress, organizationName, organizationInvitationId, code, locale
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
    });

    context('When tags property is provided', () => {

      it('should call mail provider with correct tags', async () => {
        // given
        const tags = ['JOIN_ORGA'];

        const expectedOptions = {
          from: senderEmailAddress,
          fromName,
          to: userEmailAddress,
          subject, template,
          variables: {
            organizationName,
            pixHomeName,
            pixHomeUrl,
            pixOrgaHomeUrl: pixOrgaUrl,
            locale: 'fr-fr',
            redirectionUrl: `${pixOrgaUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`
          },
          tags
        };

        // when
        await mailService.sendOrganizationInvitationEmail({
          email: userEmailAddress, organizationName, organizationInvitationId, code, tags
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
          redirectionUrl: `${pixOrgaUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`
        },
        tags: null
      };

      // when
      await mailService.sendScoOrganizationInvitationEmail({
        email: userEmailAddress,
        organizationName,
        firstName, lastName,
        organizationInvitationId, code
      });

      // then
      expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
    });
  });

});

