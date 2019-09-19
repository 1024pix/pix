const { sinon, expect } = require('../../test-helper');
const Mailjet = require('../../../lib/infrastructure/mailjet');

const nodeMailjet = require('node-mailjet');
const mailCheck = require('../../../lib/infrastructure/mail-check');
const logger = require('../../../lib/infrastructure/logger');
const mailingConfig = require('../../../lib/config').mailing;

describe('Unit | Class | Mailjet', function() {

  beforeEach(() => {
    sinon.stub(nodeMailjet, 'connect');
  });

  afterEach(() => {
    nodeMailjet.connect.restore();
  });

  describe('#sendEmail', () => {

    context('when mail sending is disabled', () => {

      beforeEach(() => {
        sinon.stub(mailCheck, 'checkMail').resolves();
        mailingConfig.enabled = false;
      });

      afterEach(() => {
        mailCheck.checkMail.restore();
      });

      it('should only return an empty promise when mail sending is disabled', () => {
        // when
        const promise = Mailjet.sendEmail({ to: 'test@example.net' });

        // then
        return expect(promise).to.be.fulfilled.then(() => {
          expect(mailCheck.checkMail).to.not.have.been.calledOnce;
        });
      });
    });
  });

  context('when mail sending is enabled', () => {

    beforeEach(() => {
      mailingConfig.enabled = true;
    });

    afterEach(() => {
      mailingConfig.enabled = false;
    });

    context('when email check fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('fail');
        sinon.stub(mailCheck, 'checkMail').rejects(error);
        sinon.stub(logger, 'warn');
      });

      it('should log a warning, not send email and resolve', async () => {
        // when
        await Mailjet.sendEmail({ to: 'test@example.net' });

        // then
        expect(nodeMailjet.connect).to.not.have.been.called;
        expect(logger.warn).to.have.been.calledWith({ err: error }, 'Could not send email to \'test@example.net\'');
      });
    });

    context('when email check succeeds', () => {

      beforeEach(() => {
        sinon.stub(mailCheck, 'checkMail').resolves(true);
      });

      it('should create an instance of mailJet', async () => {
        // given
        nodeMailjet.connect.returns({
          post: () => {
            return {
              request: () => {
              }
            };
          }
        });

        // when
        await Mailjet.sendEmail({ to: 'test@example.net' });

        // then
        sinon.assert.calledWith(nodeMailjet.connect, 'test-api-ket', 'test-api-secret');
      });

      it('should post a send instruction', async () => {
        // given
        const postStub = sinon.stub().returns({ request: (_) => Promise.resolve() });
        nodeMailjet.connect.returns({ post: postStub });

        // when
        await Mailjet.sendEmail({ to: 'test@example.net' });

        // then
        sinon.assert.calledWith(postStub, 'send');
      });

      it('should request with a payload', async () => {
        // given
        const from = 'no-reply@example.net';
        const email = 'test@example.net';
        const requestStub = sinon.stub().returns(Promise.resolve());
        const postStub = sinon.stub().returns({ request: requestStub });
        nodeMailjet.connect.returns({ post: postStub });

        // when
        await Mailjet.sendEmail({
          from,
          to: email,
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
          'Recipients': [{ 'Email': email, 'Vars': {} }]
        });
      });

      it('should have default values', async () => {
        // given
        const email = 'test@example.net';
        const requestStub = sinon.stub().returns(Promise.resolve());
        const postStub = sinon.stub().returns({ request: requestStub });
        nodeMailjet.connect.returns({ post: postStub });

        // when
        await Mailjet.sendEmail({ template: '129291', to: email });

        // then
        sinon.assert.calledWith(requestStub, {
          'FromEmail': 'communaute@pix.fr',
          'FromName': 'Communauté PIX',
          'Subject': 'Bienvenue dans la communauté PIX',
          'MJ-TemplateID': '129291',
          'MJ-TemplateLanguage': 'true',
          'Recipients': [{ 'Email': email, 'Vars': {} }]
        });
      });

      it('should set variables in values', async () => {
        // given
        const email = 'test@example.net';
        const requestStub = sinon.stub().returns(Promise.resolve());
        const postStub = sinon.stub().returns({ request: requestStub });
        const variables = { resetUrl: 'token' };
        nodeMailjet.connect.returns({ post: postStub });

        // when
        await Mailjet.sendEmail({ template: '129291', to: email, variables });

        // then
        sinon.assert.calledWith(requestStub, {
          'FromEmail': 'communaute@pix.fr',
          'FromName': 'Communauté PIX',
          'Subject': 'Bienvenue dans la communauté PIX',
          'MJ-TemplateID': '129291',
          'MJ-TemplateLanguage': 'true',
          'Recipients': [{ 'Email': email, 'Vars': variables }]
        });
      });
    });

  });
});
