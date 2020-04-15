const { sinon, expect, nock } = require('../../../test-helper');

const mailCheck = require('../../../../lib/infrastructure/mail-check');
const { mailing } = require('../../../../lib/config');

const SendinblueProvider = require('../../../../lib/infrastructure/mailers/SendinblueProvider');

describe('Unit | Class | SendinblueProvider', () => {

  beforeEach(() => {
    nock('https://api.sendinblue.com:443')
      .post('/v3/smtp/email')
      .reply();
  });

  describe('#sendEmail', () => {

    const senderEmailAddress = 'no-reply@example.net';
    const userEmailAddress = 'user@example.net';
    const templateId = 129291;

    let stubbedSendinblueSMTPApi;
    let mailingProvider;

    context('when mail sending is enabled', () => {

      beforeEach(() => {
        sinon.stub(mailing, 'enabled').value(true);
        sinon.stub(mailing, 'provider').value('sendinblue');

        sinon.stub(SendinblueProvider, 'createSendinblueSMTPApi');
        sinon.stub(mailCheck, 'checkMail').withArgs(userEmailAddress).resolves();

        stubbedSendinblueSMTPApi = { sendTransacEmail: sinon.stub() };
        SendinblueProvider.createSendinblueSMTPApi.returns(stubbedSendinblueSMTPApi);

        mailingProvider = new SendinblueProvider();
      });

      context('when email check succeeds', () => {

        it('should call the given sendinblue api instance', async () => {
          // given
          const options = {
            from: senderEmailAddress, to: userEmailAddress,
            fromName: 'Ne pas repondre', subject: 'Creation de compte',
            template: templateId
          };

          const expectedPayload = {
            to: [{
              email: userEmailAddress,
            }],
            sender: {
              name: 'Ne pas repondre',
              email: senderEmailAddress,
            },
            subject: 'Creation de compte',
            templateId,
            headers: {
              'content-type': 'application/json',
              'accept': 'application/json',
            }
          };

          // when
          await mailingProvider.sendEmail(options);

          // then
          expect(stubbedSendinblueSMTPApi.sendTransacEmail).to.have.been.calledWithExactly(expectedPayload);
        });

        context('when tags property is given', () => {

          it('should add tags when it is not a empty array', async () => {
            // given
            const tags = ['TEST'];

            const options = {
              from: senderEmailAddress, to: userEmailAddress,
              fromName: 'Ne pas repondre', subject: 'Creation de compte',
              template: templateId, tags
            };

            const expectedPayload = {
              to: [{
                email: userEmailAddress,
              }],
              sender: {
                name: 'Ne pas repondre',
                email: senderEmailAddress,
              },
              subject: 'Creation de compte',
              templateId,
              headers: {
                'content-type': 'application/json',
                'accept': 'application/json',
              },
              tags
            };

            // when
            await mailingProvider.sendEmail(options);

            // then
            expect(stubbedSendinblueSMTPApi.sendTransacEmail).to.have.been.calledWithExactly(expectedPayload);
          });

          it('should not add tags when it is empty', async () => {
            // given
            const tags = null;

            const options = {
              from: senderEmailAddress, to: userEmailAddress,
              fromName: 'Ne pas repondre', subject: 'Creation de compte',
              template: templateId, tags
            };

            const expectedPayload = {
              to: [{
                email: userEmailAddress,
              }],
              sender: {
                name: 'Ne pas repondre',
                email: senderEmailAddress,
              },
              subject: 'Creation de compte',
              templateId,
              headers: {
                'content-type': 'application/json',
                'accept': 'application/json',
              }
            };

            // when
            await mailingProvider.sendEmail(options);

            // then
            expect(stubbedSendinblueSMTPApi.sendTransacEmail).to.have.been.calledWithExactly(expectedPayload);
          });
        });
      });
    });
  });
});
