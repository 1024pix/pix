import { MailpitProvider } from '../../../../../../src/shared/mail/infrastructure/providers/MailpitProvider.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Class | MailpitProvider', function () {
  describe('#sendEmail', function () {
    const senderEmailAddress = 'no-reply@example.net';
    const userEmailAddress = 'user@example.net';
    const templateId = 129291;

    let stubbedSmtpMailerClient;
    let mailingProvider;

    context('when email check succeeds', function () {
      beforeEach(function () {
        sinon.stub(MailpitProvider, 'createSmtpMailerClient');

        stubbedSmtpMailerClient = { sendEmail: sinon.stub() };
        MailpitProvider.createSmtpMailerClient.returns(stubbedSmtpMailerClient);

        mailingProvider = new MailpitProvider();
      });

      it('calls the given smtp mailer client with the correct payload', async function () {
        // given
        const options = {
          from: senderEmailAddress,
          to: userEmailAddress,
          fromName: 'Ne pas repondre',
          subject: 'Creation de compte',
          template: templateId,
          variables: { foo: 'bar' },
        };

        const expectedPayload = {
          from: senderEmailAddress,
          to: userEmailAddress,
          fromName: 'Ne pas repondre',
          subject: 'Creation de compte',
          text: '{\n  "templateId": 129291,\n  "foo": "bar"\n}',
        };

        // when
        await mailingProvider.sendEmail(options);

        // then
        expect(stubbedSmtpMailerClient.sendEmail).to.have.been.calledWithExactly(expectedPayload);
      });
    });
  });
});
