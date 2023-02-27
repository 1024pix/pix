const { sinon, expect, nock, catchErr } = require('../../../test-helper');

const mailCheck = require('../../../../lib/infrastructure/mail-check');
const { mailing } = require('../../../../lib/config');

const SendinblueProvider = require('../../../../lib/infrastructure/mailers/SendinblueProvider');
const {
  MailingProviderInvalidEmailError,
} = require('../../../../lib/infrastructure/mailers/MailingProviderInvalidEmailError');

describe('Unit | Class | SendinblueProvider', function () {
  beforeEach(function () {
    nock('https://api.sendinblue.com:443').post('/v3/smtp/email').reply();
  });

  describe('#sendEmail', function () {
    const senderEmailAddress = 'no-reply@example.net';
    const userEmailAddress = 'user@example.net';
    const templateId = 129291;

    let stubbedSendinblueSMTPApi;
    let mailingProvider;

    context('when mail sending is enabled', function () {
      beforeEach(function () {
        sinon.stub(mailing, 'enabled').value(true);
        sinon.stub(mailing, 'provider').value('sendinblue');

        sinon.stub(SendinblueProvider, 'createSendinblueSMTPApi');
        sinon.stub(mailCheck, 'checkDomainIsValid').withArgs(userEmailAddress).resolves();

        stubbedSendinblueSMTPApi = { sendTransacEmail: sinon.stub() };
        SendinblueProvider.createSendinblueSMTPApi.returns(stubbedSendinblueSMTPApi);

        mailingProvider = new SendinblueProvider();
      });

      context('when email check succeeds', function () {
        it('should call the given sendinblue api instance', async function () {
          // given
          const options = {
            from: senderEmailAddress,
            to: userEmailAddress,
            fromName: 'Ne pas repondre',
            subject: 'Creation de compte',
            template: templateId,
          };

          const expectedPayload = {
            to: [
              {
                email: userEmailAddress,
              },
            ],
            sender: {
              name: 'Ne pas repondre',
              email: senderEmailAddress,
            },
            subject: 'Creation de compte',
            templateId,
            headers: {
              'content-type': 'application/json',
              accept: 'application/json',
            },
          };

          // when
          await mailingProvider.sendEmail(options);

          // then
          expect(stubbedSendinblueSMTPApi.sendTransacEmail).to.have.been.calledWithExactly(expectedPayload);
        });

        context('when tags property is given', function () {
          it('should add tags when it is not a empty array', async function () {
            // given
            const tags = ['TEST'];

            const options = {
              from: senderEmailAddress,
              to: userEmailAddress,
              fromName: 'Ne pas repondre',
              subject: 'Creation de compte',
              template: templateId,
              tags,
            };

            const expectedPayload = {
              to: [
                {
                  email: userEmailAddress,
                },
              ],
              sender: {
                name: 'Ne pas repondre',
                email: senderEmailAddress,
              },
              subject: 'Creation de compte',
              templateId,
              headers: {
                'content-type': 'application/json',
                accept: 'application/json',
              },
              tags,
            };

            // when
            await mailingProvider.sendEmail(options);

            // then
            expect(stubbedSendinblueSMTPApi.sendTransacEmail).to.have.been.calledWithExactly(expectedPayload);
          });

          it('should not add tags when it is empty', async function () {
            // given
            const tags = null;

            const options = {
              from: senderEmailAddress,
              to: userEmailAddress,
              fromName: 'Ne pas repondre',
              subject: 'Creation de compte',
              template: templateId,
              tags,
            };

            const expectedPayload = {
              to: [
                {
                  email: userEmailAddress,
                },
              ],
              sender: {
                name: 'Ne pas repondre',
                email: senderEmailAddress,
              },
              subject: 'Creation de compte',
              templateId,
              headers: {
                'content-type': 'application/json',
                accept: 'application/json',
              },
            };

            // when
            await mailingProvider.sendEmail(options);

            // then
            expect(stubbedSendinblueSMTPApi.sendTransacEmail).to.have.been.calledWithExactly(expectedPayload);
          });
        });
      });

      context('when email sending fails with code invalid_parameter', function () {
        it('should throw a MailingProviderInvalidEmailError with provider message', async function () {
          // given
          const options = {
            from: senderEmailAddress,
            to: userEmailAddress,
            fromName: 'Ne pas repondre',
            subject: 'Creation de compte',
            template: templateId,
          };
          stubbedSendinblueSMTPApi.sendTransacEmail.rejects({
            response: { text: '{"code":"invalid_parameter","message":"email is not valid in to"}' },
          });

          // when
          const error = await catchErr(mailingProvider.sendEmail, mailingProvider)(options);

          // then
          expect(error).to.be.instanceof(MailingProviderInvalidEmailError);
          expect(error.message).to.equal('email is not valid in to');
        });
      });
    });
  });
});
