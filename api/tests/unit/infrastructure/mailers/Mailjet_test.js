const { sinon, expect } = require('../../../test-helper');
const Mailjet = require('../../../../lib/infrastructure/mailers/mailjet');
const nodeMailjet = require('node-mailjet');
const mailCheck = require('../../../../lib/infrastructure/mail-check');
const { mailing } = require('../../../../lib/config');
const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Class | Mailjet', function() {

  beforeEach(() => {
    sinon.stub(nodeMailjet, 'connect');
  });

  describe('#sendEmail', () => {

    const recipient = 'test@example.net';

    context('when mail sending is disabled', () => {

      beforeEach(() => {
        sinon.stub(mailing, 'enabled').value(false);
        sinon.stub(mailCheck, 'checkMail').withArgs(recipient).resolves();
      });

      it('should only return an empty promise when mail sending is disabled', () => {
        // given
        const mailer = new Mailjet();

        // when
        const promise = mailer.sendEmail({ to: recipient });

        // then
        return expect(promise).to.be.fulfilled.then(() => {
          expect(mailCheck.checkMail).to.not.have.been.calledOnce;
        });
      });
    });


    context('when mail sending is enabled', () => {

      beforeEach(() => {
        sinon.stub(mailing, 'enabled').value(true);
        sinon.stub(mailing, 'provider').value('mailjet');
      });

      context('when email check fails', () => {
        let error;

        beforeEach(() => {
          error = new Error('fail');
          sinon.stub(mailCheck, 'checkMail').rejects(error);
          sinon.stub(logger, 'warn');
        });

        it('should log a warning, not send email and resolve', async () => {
          // given
          const mailer = new Mailjet();

          // when
          await mailer.sendEmail({ to: recipient });

          // then
          expect(logger.warn).to.have.been.calledWith({ err: error }, 'Email is not valid \'test@example.net\'');
        });
      });

      context('when email check succeeds', () => {

        beforeEach(() => {
          sinon.stub(mailCheck, 'checkMail').withArgs(recipient).resolves();
        });

        it('should create an instance of mailJet', async () => {
          // given
          const mailer = new Mailjet();
          nodeMailjet.connect.returns({
            post: () => {
              return {
                request: () => {
                }
              };
            }
          });

          // when
          await mailer.sendEmail({ to: recipient });

          // then
          sinon.assert.calledWith(nodeMailjet.connect, 'test-api-key', 'test-api-secret');
        });

        it('should post a send instruction', async () => {
          // given
          const postStub = sinon.stub().returns({ request: (_) => Promise.resolve() });
          nodeMailjet.connect.returns({ post: postStub });
          const mailer = new Mailjet();

          // when
          await mailer.sendEmail({ to: recipient });

          // then
          sinon.assert.calledWith(postStub, 'send');
        });

        it('should request with a payload', async () => {
          // given
          const from = 'no-reply@example.net';
          const requestStub = sinon.stub().returns(Promise.resolve());
          const postStub = sinon.stub().returns({ request: requestStub });
          nodeMailjet.connect.returns({ post: postStub });
          const mailer = new Mailjet();

          // when
          await mailer.sendEmail({
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
          const mailer = new Mailjet();

          // when
          await mailer.sendEmail({ template: '129291', to: recipient });

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
          const mailer = new Mailjet();

          // when
          await mailer.sendEmail({ template: '129291', to: recipient, variables });

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
