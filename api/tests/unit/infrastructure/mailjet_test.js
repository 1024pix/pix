const { describe, it, beforeEach, afterEach, sinon, expect } = require('../../test-helper');
const Mailjet = require('../../../lib/infrastructure/mailjet');

const nodeMailjet = require('node-mailjet');

describe('Unit | Class | Mailjet', function() {

  beforeEach(() => {
    sinon.stub(nodeMailjet, 'connect');
  });

  afterEach(() => {
    nodeMailjet.connect.restore();
  });

  describe('#sendEmail', () => {

    it('should create an instance of mailJet', () => {
      // Given
      nodeMailjet.connect.returns({
        post: () => {
          return {
            request: () => {
            }
          };
        }
      });

      // When
      Mailjet.sendEmail();

      // Then
      sinon.assert.calledWith(nodeMailjet.connect, 'test-api-ket', 'test-api-secret');
    });

    it('should post a send instruction', () => {
      // Given
      const postStub = sinon.stub().returns({ request: _ => Promise.resolve() });
      nodeMailjet.connect.returns({ post: postStub });

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
      nodeMailjet.connect.returns({ post: postStub });

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
          'Recipients': [{ 'Email': email, 'Vars': {} }]
        });
      });
    });

    it('should have default values', () => {
      // Given
      const email = 'test@example.net';
      const requestStub = sinon.stub().returns(Promise.resolve());
      const postStub = sinon.stub().returns({ request: requestStub });
      nodeMailjet.connect.returns({ post: postStub });

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
          'Recipients': [{ 'Email': email, 'Vars': {} }]
        });
      });
    });

    it('should set variables in values', () => {
      // Given
      const email = 'test@example.net';
      const requestStub = sinon.stub().returns(Promise.resolve());
      const postStub = sinon.stub().returns({ request: requestStub });
      const variables = { resetUrl: 'token' };
      nodeMailjet.connect.returns({ post: postStub });

      // When
      const result = Mailjet.sendEmail({ template: '129291', to: email, variables });

      // Then
      return result.then(() => {
        sinon.assert.calledWith(requestStub, {
          'FromEmail': 'communaute@pix.beta.gouv.fr',
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
      // When
      Mailjet.getContactListByName();

      // Then
      sinon.assert.calledWith(nodeMailjet.connect, 'test-api-ket', 'test-api-secret');
    });

    it('should retrieve contact list', () => {
      // When
      Mailjet.getContactListByName();

      // Then
      sinon.assert.calledWith(getStub, 'contactslist');
    });

    it('should retrieve a specific ', () => {
      // Given
      const name = 'CONTACT-LIST-NAME';

      // When
      Mailjet.getContactListByName(name);

      // Then
      sinon.assert.calledWith(requestStub, { Name: name });
    });

    it('should extract information from the payload', () => {
      // Given
      const name = 'CONTACT-LIST-NAME';

      // When
      const promise = Mailjet.getContactListByName(name);

      // Then
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
      // When
      Mailjet.addEmailToContactList(email, contactListID);

      // Then
      sinon.assert.calledWith(nodeMailjet.connect, 'test-api-ket', 'test-api-secret');
    });

    it('should add email to a contact list', () => {
      // When
      const promise = Mailjet.addEmailToContactList(email, contactListID);

      // Then
      return promise.then(() => {
        sinon.assert.calledWith(postStub, 'contactslist');
        sinon.assert.calledWith(idStub, contactListID);
        sinon.assert.calledWith(actionStub, 'managecontact');
        sinon.assert.calledWith(requestStub, { Email: email, action: 'addnoforce' });
      });
    });
  });
});
