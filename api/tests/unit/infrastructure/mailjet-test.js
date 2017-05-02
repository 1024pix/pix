const { describe, it, beforeEach, afterEach, sinon, expect } = require('../../test-helper');
const Mailjet = require('../../../lib/infrastructure/mailjet');

const nodeMailjet = require('node-mailjet');

describe('Unit | Class | Mailjet', function () {

  describe('#sendEmail', () => {

    let mailJetConnectStub;

    beforeEach(() => {
      mailJetConnectStub = sinon.stub(nodeMailjet, "connect");
    });

    afterEach(() => {
      mailJetConnectStub.restore();
    });

    it('should create an instance of mailJet', () => {
      // Given
      mailJetConnectStub.returns({
        post: () => {
          return {
            request: () => {
            }
          }
        }
      });

      // When
      Mailjet.sendEmail();

      // Then
      sinon.assert.calledWith(mailJetConnectStub, 'test-api-ket', 'test-api-secret')
    });

    it('should post a send instruction', () => {
      // Given
      const postStub = sinon.stub().returns({ request: _ => Promise.resolve() });
      mailJetConnectStub.returns({ post: postStub });

      // When
      const result = Mailjet.sendEmail();

      // Then
      return result.then(() => {
        sinon.assert.calledWith(postStub, 'send');
      });
    });

    it('should request with a payload', () => {
      // Given
      const from = 'no-reply@example.net';
      const email = 'test@example.net';
      const requestStub = sinon.stub().returns(Promise.resolve());
      const postStub = sinon.stub().returns({ request: requestStub });
      mailJetConnectStub.returns({ post: postStub });

      // When
      const result = Mailjet.sendEmail({
        from,
        to: email,
        fromName: 'Ne Pas Repondre',
        subject: 'Creation de compte',
        template: '129291'
      });

      // Then
      return result.then(() => {
        sinon.assert.calledWith(requestStub, {
          'FromEmail': 'no-reply@example.net',
          'FromName': 'Ne Pas Repondre',
          'Subject': 'Creation de compte',
          'MJ-TemplateID': '129291',
          'MJ-TemplateLanguage': 'true',
          'Recipients': [ { 'Email': email } ]
        });
      });
    });

    it('should have default values', () => {
      // Given
      const email = 'test@example.net';
      const requestStub = sinon.stub().returns(Promise.resolve());
      const postStub = sinon.stub().returns({ request: requestStub });
      mailJetConnectStub.returns({ post: postStub });

      // When
      const result = Mailjet.sendEmail({ template: '129291', to: email });

      // Then
      return result.then(() => {
        sinon.assert.calledWith(requestStub, {
          'FromEmail': 'communaute@pix.beta.gouv.fr',
          'FromName': 'Communauté PIX',
          'Subject': 'Bienvenue dans la communauté PIX',
          'MJ-TemplateID': '129291',
          'MJ-TemplateLanguage': 'true',
          'Recipients': [ { 'Email': email } ]
        });
      });
    });

  });
});
