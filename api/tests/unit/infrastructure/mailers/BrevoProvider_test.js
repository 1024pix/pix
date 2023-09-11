import { sinon, expect, nock, catchErr } from '../../../test-helper.js';
import { config } from '../../../../lib/config.js';
import { BrevoProvider } from '../../../../lib/infrastructure/mailers/BrevoProvider.js';
import { MailingProviderInvalidEmailError } from '../../../../lib/infrastructure/mailers/MailingProviderInvalidEmailError.js';
const { mailing } = config;

describe('Unit | Class | BrevoProvider', function () {
  beforeEach(function () {
    nock('https://api.sendinblue.com:443').post('/v3/smtp/email').reply();
  });

  describe('#sendEmail', function () {
    const senderEmailAddress = 'no-reply@example.net';
    const userEmailAddress = 'user@example.net';
    const templateId = 129291;

    let stubbedBrevoSMTPApi;
    let mailingProvider;

    context('when mail sending is enabled', function () {
      beforeEach(function () {
        sinon.stub(mailing, 'enabled').value(true);
        sinon.stub(mailing, 'provider').value('brevo');

        sinon.stub(BrevoProvider, 'createBrevoSMTPApi');

        stubbedBrevoSMTPApi = { sendTransacEmail: sinon.stub() };
        BrevoProvider.createBrevoSMTPApi.returns(stubbedBrevoSMTPApi);

        mailingProvider = new BrevoProvider();
      });

      context('when email check succeeds', function () {
        it('should call the given brevo api instance', async function () {
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
          expect(stubbedBrevoSMTPApi.sendTransacEmail).to.have.been.calledWithExactly(expectedPayload);
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
            expect(stubbedBrevoSMTPApi.sendTransacEmail).to.have.been.calledWithExactly(expectedPayload);
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
            expect(stubbedBrevoSMTPApi.sendTransacEmail).to.have.been.calledWithExactly(expectedPayload);
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
          stubbedBrevoSMTPApi.sendTransacEmail.rejects({
            response: { text: '{"code":"invalid_parameter","message":"email is not valid in to"}' },
          });

          // when
          const error = await catchErr(mailingProvider.sendEmail, mailingProvider)(options);

          // then
          expect(error).to.be.instanceof(MailingProviderInvalidEmailError);
          expect(error.message).to.equal('email is not valid in to');
        });
      });

      context('when an underlying infrascture error is thrown', function () {
        it('should throw an error with the message', async function () {
          // given
          const options = {
            from: senderEmailAddress,
            to: userEmailAddress,
            fromName: 'Ne pas repondre',
            subject: 'Creation de compte',
            template: templateId,
          };
          stubbedBrevoSMTPApi.sendTransacEmail.rejects(new Error('Error: write EPROTO routines:ssl3_read_bytes:tlsv1'));

          // when
          const error = await catchErr(mailingProvider.sendEmail, mailingProvider)(options);

          // then
          expect(error.message).to.equal('Error: write EPROTO routines:ssl3_read_bytes:tlsv1');
        });
      });
    });
  });
});
