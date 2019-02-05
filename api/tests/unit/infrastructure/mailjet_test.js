const { sinon, expect } = require('../../test-helper');
const Mailjet = require('../../../lib/infrastructure/mailjet');

const nodeMailjet = require('node-mailjet');
const mailCheck = require('../../../lib/infrastructure/mail-check');
const logger = require('../../../lib/infrastructure/logger');

describe('Unit | Class | Mailjet', function() {

  beforeEach(() => {
    sinon.stub(nodeMailjet, 'connect');
  });

  describe('#sendEmail', () => {

    describe('when email check fails', () => {
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

    describe('when email check succeeds', () => {

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

  describe('#getContactEmailByName', () => {
    let getStub;
    let requestStub;

    const contactListDetails = {
      'Address': 'Xpgno5zs4',
      'CreatedAt': '2017-05-10T08:06:17Z',
      'ID': 1766080,
      'IsDeleted': false,
      'Name': 'WEBPIX',
      'SubscriberCount': 0
    };

    beforeEach(() => {
      const mailJetResponse = {
        'response': {
          'req': {
            'method': 'GET',
            'url': 'WEBPIX',
            'headers': {
              'content-type': 'application/json',
              'authorization': 'Basic '
            }
          }
        },
        'body': {
          'Count': 1,
          'Data': [
            contactListDetails
          ],
          'Total': 1
        }
      };

      requestStub = sinon.stub().returns(Promise.resolve(mailJetResponse));
      getStub = sinon.stub().returns({
        request: requestStub
      });
      nodeMailjet.connect.returns({
        get: getStub
      });
    });

    it('should connect to MailJet', () => {
      // when
      Mailjet.getContactListByName();

      // then
      sinon.assert.calledWith(nodeMailjet.connect, 'test-api-ket', 'test-api-secret');
    });

    it('should retrieve contact list', () => {
      // when
      Mailjet.getContactListByName();

      // then
      sinon.assert.calledWith(getStub, 'contactslist');
    });

    it('should retrieve a specific ', () => {
      // given
      const name = 'CONTACT-LIST-NAME';

      // when
      Mailjet.getContactListByName(name);

      // then
      sinon.assert.calledWith(requestStub, { Name: name });
    });

    it('should extract information from the payload', () => {
      // given
      const name = 'CONTACT-LIST-NAME';

      // when
      const promise = Mailjet.getContactListByName(name);

      // then
      return promise.then((contactDetails) => {
        expect(contactDetails).to.deep.equal(contactListDetails);
      });
    });
  });

  describe('#addEmailToContactList', () => {

    const contactListID = 23609373;
    const email = 'test@example.net';

    let requestStub;
    let actionStub;
    let idStub;
    let postStub;
    let mailJetMock;

    beforeEach(() => {
      requestStub = sinon.stub().returns(Promise.resolve());
      actionStub = sinon.stub().returns({ request: requestStub });
      idStub = sinon.stub().returns({ action: actionStub });
      postStub = sinon.stub().returns({ id: idStub });
      mailJetMock = {
        post: postStub
      };

      nodeMailjet.connect.returns(mailJetMock);
    });

    it('should connect to mailjet', () => {
      // when
      Mailjet.addEmailToContactList(email, contactListID);

      // then
      sinon.assert.calledWith(nodeMailjet.connect, 'test-api-ket', 'test-api-secret');
    });

    it('should add email to a contact list', () => {
      // when
      const promise = Mailjet.addEmailToContactList(email, contactListID);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(postStub, 'contactslist');
        sinon.assert.calledWith(idStub, contactListID);
        sinon.assert.calledWith(actionStub, 'managecontact');
        sinon.assert.calledWith(requestStub, { Email: email, action: 'addnoforce' });
      });
    });
  });
});
