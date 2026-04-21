import sinon from 'sinon';

import {
  ENGLISH_SPOKEN,
  FRENCH_FRANCE,
  FRENCH_SPOKEN,
} from '../../../../../src/shared/domain/services/locale-service.js';
import * as mailService from '../../../../../src/shared/domain/services/mail-service.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { mailer } from '../../../../../src/shared/mail/infrastructure/services/mailer.js';

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
          // given
          const locale = FRENCH_SPOKEN;
          const i18n = getI18n(locale);

          // when
          await mailService.sendOrganizationInvitationEmail({
            email: userEmailAddress,
            organizationName,
            organizationInvitationId,
            code,
            locale,
          });

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('Pix Orga - Ne pas répondre');
          expect(options.subject).to.equal(i18n.__('organization-invitation-email.subject'));
          expect(options.variables).to.include({
            pixHomeName: 'pix.org',
            pixHomeUrl: 'https://pix.org/fr',
            pixOrgaHomeUrl: 'https://orga.pix.org/?locale=fr',
            redirectionUrl: `https://orga.pix.org/rejoindre?invitationId=${organizationInvitationId}&code=${code}&locale=fr`,
            supportUrl: 'https://pix.org/fr/support',
            acceptInvitation: i18n.__('organization-invitation-email.params.acceptInvitation'),
            doNotAnswer: i18n.__('organization-invitation-email.params.doNotAnswer'),
            here: i18n.__('organization-invitation-email.params.here'),
            moreAbout: i18n.__('organization-invitation-email.params.moreAbout'),
            needHelp: i18n.__('organization-invitation-email.params.needHelp'),
            oneTimeLink: i18n.__('organization-invitation-email.params.oneTimeLink'),
            pixPresentation: i18n.__('organization-invitation-email.params.pixPresentation'),
            subtitle: i18n.__('organization-invitation-email.params.subtitle'),
            title: i18n.__('organization-invitation-email.params.title'),
            yourOrganization: i18n.__('organization-invitation-email.params.yourOrganization'),
          });
        });

        it(`when locale is ${FRENCH_FRANCE}`, async function () {
          // given
          const locale = FRENCH_FRANCE;
          const i18n = getI18n(locale);

          // when
          await mailService.sendOrganizationInvitationEmail({
            email: userEmailAddress,
            organizationName,
            organizationInvitationId,
            code,
            locale,
          });

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('Pix Orga - Ne pas répondre');
          expect(options.subject).to.equal(i18n.__('organization-invitation-email.subject'));
          expect(options.variables).to.include({
            pixHomeName: 'pix.fr',
            pixHomeUrl: 'https://pix.fr',
            pixOrgaHomeUrl: 'https://orga.pix.fr/',
            redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
            supportUrl: 'https://pix.fr/support',
            acceptInvitation: i18n.__('organization-invitation-email.params.acceptInvitation'),
            doNotAnswer: i18n.__('organization-invitation-email.params.doNotAnswer'),
            here: i18n.__('organization-invitation-email.params.here'),
            moreAbout: i18n.__('organization-invitation-email.params.moreAbout'),
            needHelp: i18n.__('organization-invitation-email.params.needHelp'),
            oneTimeLink: i18n.__('organization-invitation-email.params.oneTimeLink'),
            pixPresentation: i18n.__('organization-invitation-email.params.pixPresentation'),
            subtitle: i18n.__('organization-invitation-email.params.subtitle'),
            title: i18n.__('organization-invitation-email.params.title'),
            yourOrganization: i18n.__('organization-invitation-email.params.yourOrganization'),
          });
        });

        it('when locale is undefined', async function () {
          // given
          const locale = undefined;
          const i18n = getI18n(locale);

          // when
          await mailService.sendOrganizationInvitationEmail({
            email: userEmailAddress,
            organizationName,
            organizationInvitationId,
            code,
            locale,
          });

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('Pix Orga - Ne pas répondre');
          expect(options.subject).to.equal(i18n.__('organization-invitation-email.subject'));
          expect(options.variables).to.include({
            pixHomeName: 'pix.fr',
            pixHomeUrl: 'https://pix.fr',
            pixOrgaHomeUrl: 'https://orga.pix.fr/',
            redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
            supportUrl: 'https://pix.fr/support',
            acceptInvitation: i18n.__('organization-invitation-email.params.acceptInvitation'),
            doNotAnswer: i18n.__('organization-invitation-email.params.doNotAnswer'),
            here: i18n.__('organization-invitation-email.params.here'),
            moreAbout: i18n.__('organization-invitation-email.params.moreAbout'),
            needHelp: i18n.__('organization-invitation-email.params.needHelp'),
            oneTimeLink: i18n.__('organization-invitation-email.params.oneTimeLink'),
            pixPresentation: i18n.__('organization-invitation-email.params.pixPresentation'),
            subtitle: i18n.__('organization-invitation-email.params.subtitle'),
            title: i18n.__('organization-invitation-email.params.title'),
            yourOrganization: i18n.__('organization-invitation-email.params.yourOrganization'),
          });
        });

        it(`when locale is ${ENGLISH_SPOKEN}`, async function () {
          // given
          const locale = ENGLISH_SPOKEN;
          const i18n = getI18n(locale);

          // when
          await mailService.sendOrganizationInvitationEmail({
            email: userEmailAddress,
            organizationName,
            organizationInvitationId,
            code,
            locale,
          });

          // then
          const options = mailer.sendEmail.firstCall.args[0];
          expect(options.fromName).to.equal('Pix Orga - Noreply');
          expect(options.subject).to.equal(i18n.__('organization-invitation-email.subject'));
          expect(options.variables).to.include({
            pixHomeName: 'pix.org',
            pixHomeUrl: 'https://pix.org/en',
            pixOrgaHomeUrl: 'https://orga.pix.org/?locale=en',
            redirectionUrl: `https://orga.pix.org/rejoindre?invitationId=${organizationInvitationId}&code=${code}&locale=en`,
            supportUrl: 'https://pix.org/en/support',
            acceptInvitation: i18n.__('organization-invitation-email.params.acceptInvitation'),
            doNotAnswer: i18n.__('organization-invitation-email.params.doNotAnswer'),
            here: i18n.__('organization-invitation-email.params.here'),
            moreAbout: i18n.__('organization-invitation-email.params.moreAbout'),
            needHelp: i18n.__('organization-invitation-email.params.needHelp'),
            oneTimeLink: i18n.__('organization-invitation-email.params.oneTimeLink'),
            pixPresentation: i18n.__('organization-invitation-email.params.pixPresentation'),
            subtitle: i18n.__('organization-invitation-email.params.subtitle'),
            title: i18n.__('organization-invitation-email.params.title'),
            yourOrganization: i18n.__('organization-invitation-email.params.yourOrganization'),
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
          pixOrgaHomeUrl: 'https://orga.pix.fr/',
          redirectionUrl: `https://orga.pix.fr/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
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
      // given
      const locale = undefined;
      const i18n = getI18n(locale);

      // when
      await mailService.sendCertificationCenterInvitationEmail({
        email: 'invited@example.net',
        certificationCenterName: 'Centre Pixou',
        certificationCenterInvitationId: 7,
        code: 'ABCDEFGH01',
        locale,
      });

      // then
      const sendEmailParameters = mailer.sendEmail.firstCall.args[0];

      expect(sendEmailParameters.subject).to.equal(i18n.__('certification-center-invitation-email.subject'));
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
        acceptInvitation: i18n.__('certification-center-invitation-email.params.acceptInvitation'),
        doNotAnswer: i18n.__('certification-center-invitation-email.params.doNotAnswer'),
        here: i18n.__('certification-center-invitation-email.params.here'),
        moreAbout: i18n.__('certification-center-invitation-email.params.moreAbout'),
        needHelp: i18n.__('certification-center-invitation-email.params.needHelp'),
        oneTimeLink: i18n.__('certification-center-invitation-email.params.oneTimeLink'),
        pixCertifPresentation: i18n.__('certification-center-invitation-email.params.pixCertifPresentation'),
        title: i18n.__('certification-center-invitation-email.params.title'),
        yourCertificationCenter: i18n.__('certification-center-invitation-email.params.yourCertificationCenter'),
      });
    });

    context(`when locale is ${FRENCH_SPOKEN}`, function () {
      it('should call sendEmail with localized variable options', async function () {
        // given
        const locale = FRENCH_SPOKEN;
        const i18n = getI18n(locale);

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
        expect(sendEmailParameters.subject).to.equal(i18n.__('certification-center-invitation-email.subject'));
        expect(sendEmailParameters.fromName).to.equal('Pix Certif - Ne pas répondre');
        expect(sendEmailParameters.variables).to.include({
          certificationCenterName: 'Centre Pixi',
          pixHomeName: 'pix.org',
          pixHomeUrl: 'https://pix.org/fr',
          pixCertifHomeUrl: 'https://certif.pix.org/?locale=fr',
          redirectionUrl: `https://certif.pix.org/rejoindre?invitationId=7&code=AAABBBCCC7&locale=fr`,
          supportUrl: 'https://pix.org/fr/support',
          acceptInvitation: i18n.__('certification-center-invitation-email.params.acceptInvitation'),
          doNotAnswer: i18n.__('certification-center-invitation-email.params.doNotAnswer'),
          here: i18n.__('certification-center-invitation-email.params.here'),
          moreAbout: i18n.__('certification-center-invitation-email.params.moreAbout'),
          needHelp: i18n.__('certification-center-invitation-email.params.needHelp'),
          oneTimeLink: i18n.__('certification-center-invitation-email.params.oneTimeLink'),
          pixCertifPresentation: i18n.__('certification-center-invitation-email.params.pixCertifPresentation'),
          title: i18n.__('certification-center-invitation-email.params.title'),
          yourCertificationCenter: i18n.__('certification-center-invitation-email.params.yourCertificationCenter'),
        });
      });
    });

    context(`when locale is ${ENGLISH_SPOKEN}`, function () {
      it('should call sendEmail with localized variable options', async function () {
        // given
        const locale = ENGLISH_SPOKEN;
        const i18n = getI18n(locale);

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
        expect(sendEmailParameters.subject).to.equal(i18n.__('certification-center-invitation-email.subject'));
        expect(sendEmailParameters.fromName).to.equal('Pix Certif - Noreply');
        expect(sendEmailParameters.variables).to.include({
          certificationCenterName: 'Centre Pixi',
          pixHomeName: 'pix.org',
          pixHomeUrl: 'https://pix.org/en',
          pixCertifHomeUrl: 'https://certif.pix.org/?locale=en',
          redirectionUrl: `https://certif.pix.org/rejoindre?invitationId=777&code=LLLJJJVVV1&locale=en`,
          supportUrl: 'https://pix.org/en/support',
          acceptInvitation: i18n.__('certification-center-invitation-email.params.acceptInvitation'),
          doNotAnswer: i18n.__('certification-center-invitation-email.params.doNotAnswer'),
          here: i18n.__('certification-center-invitation-email.params.here'),
          moreAbout: i18n.__('certification-center-invitation-email.params.moreAbout'),
          needHelp: i18n.__('certification-center-invitation-email.params.needHelp'),
          oneTimeLink: i18n.__('certification-center-invitation-email.params.oneTimeLink'),
          pixCertifPresentation: i18n.__('certification-center-invitation-email.params.pixCertifPresentation'),
          title: i18n.__('certification-center-invitation-email.params.title'),
          yourCertificationCenter: i18n.__('certification-center-invitation-email.params.yourCertificationCenter'),
        });
      });
    });
  });

  describe('#sendAccountRecoveryEmail', function () {
    it('calls sendEmail with from, to, template, tags', async function () {
      // given
      const locale = FRENCH_FRANCE;
      const i18n = getI18n(locale);

      const firstName = 'Carla';
      const temporaryKey = 'a-temporary-key';
      const email = 'carla@example.net';
      const redirectionUrl = `https://test.app.pix.fr/recuperer-mon-compte/${temporaryKey}`;

      // when
      await mailService.sendAccountRecoveryEmail({ email, firstName, temporaryKey });

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
          choosePassword: i18n.__('account-recovery-email.params.choosePassword'),
          context: i18n.__('account-recovery-email.params.context'),
          doNotAnswer: i18n.__('account-recovery-email.params.doNotAnswer'),
          instruction: i18n.__('account-recovery-email.params.instruction'),
          linkValidFor: i18n.__('account-recovery-email.params.linkValidFor'),
          moreOn: i18n.__('account-recovery-email.params.moreOn'),
          pixPresentation: i18n.__('account-recovery-email.params.pixPresentation'),
          signing: i18n.__('account-recovery-email.params.signing'),
        },
      };
      const options = mailer.sendEmail.firstCall.args[0];
      expect(options).to.deep.include(expectedOptions);
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
});
