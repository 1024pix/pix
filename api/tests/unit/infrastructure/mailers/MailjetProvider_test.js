const nodeMailjet = require('node-mailjet');
const { sinon } = require('../../../test-helper');
const MailjetProvider = require('../../../../lib/infrastructure/mailers/MailjetProvider');
const mailCheck = require('../../../../lib/infrastructure/mail-check');
const { mailing } = require('../../../../lib/config');

describe('Unit | Class | MailjetProvider', function() {

  beforeEach(() => {
    sinon.stub(nodeMailjet, 'connect');
  });

  describe('#sendEmail', () => {

    const recipient = 'test@example.net';

    context('when mail sending is enabled', () => {

      beforeEach(() => {
        sinon.stub(mailing, 'enabled').value(true);
        sinon.stub(mailing, 'provider').value('mailjet');
      });

      context('when email check succeeds', () => {

        beforeEach(() => {
          sinon.stub(mailCheck, 'checkMail').withArgs(recipient).resolves();
        });

        it('should request with a payload', async () => {
          // given
          const from = 'no-reply@example.net';
          const requestStub = sinon.stub().returns(Promise.resolve());
          const postStub = sinon.stub().returns({ request: requestStub });
          nodeMailjet.connect.returns({ post: postStub });
          const mailingProvider = new MailjetProvider();

          // when
          await mailingProvider.sendEmail({
            from,
            to: recipient,
            fromName: 'Ne Pas Repondre',
            subject: 'Creation de compte',
            template: '129291'
          });

          // then
          sinon.assert.calledWith(requestStub, {
            'FromEmail': 'no-reply@example.net',
            'FromName': 'Ne Pas Repondre',
            'Subject': 'Creation de compte',
            'MJ-TemplateID': '129291',
            'MJ-TemplateLanguage': 'true',
            'Recipients': [{ 'Email': recipient, 'Vars': {} }]
          });
        });

        it('should have default values', async () => {
          // given
          const requestStub = sinon.stub().returns(Promise.resolve());
          const postStub = sinon.stub().returns({ request: requestStub });
          nodeMailjet.connect.returns({ post: postStub });
          const mailingProvider = new MailjetProvider();

          // when
          await mailingProvider.sendEmail({ template: '129291', to: recipient });

          // then
          sinon.assert.calledWith(requestStub, {
            'FromEmail': 'communaute@pix.fr',
            'FromName': 'Communauté PIX',
            'Subject': 'Bienvenue dans la communauté PIX',
            'MJ-TemplateID': '129291',
            'MJ-TemplateLanguage': 'true',
            'Recipients': [{ 'Email': recipient, 'Vars': {} }]
          });
        });

        it('should set variables in values', async () => {
          // given
          const requestStub = sinon.stub().returns(Promise.resolve());
          const postStub = sinon.stub().returns({ request: requestStub });
          const variables = { resetUrl: 'token' };
          nodeMailjet.connect.returns({ post: postStub });
          const mailingProvider = new MailjetProvider();

          // when
          await mailingProvider.sendEmail({ template: '129291', to: recipient, variables });

          // then
          sinon.assert.calledWith(requestStub, {
            'FromEmail': 'communaute@pix.fr',
            'FromName': 'Communauté PIX',
            'Subject': 'Bienvenue dans la communauté PIX',
            'MJ-TemplateID': '129291',
            'MJ-TemplateLanguage': 'true',
            'Recipients': [{ 'Email': recipient, 'Vars': variables }]
          });
        });
      });
    });
  });
});
