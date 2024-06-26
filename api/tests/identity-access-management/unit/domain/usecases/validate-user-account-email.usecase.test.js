import { monitoringTools } from '../../../../../lib/infrastructure/monitoring-tools.js';
import { validateUserAccountEmail } from '../../../../../src/identity-access-management/domain/usecases/validate-user-account-email.usecase.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | validate-user-account-email', function () {
  let emailValidationDemandRepository, userRepository;
  let clock, now;

  const token = '00000000-0000-0000-0000-000000000000';
  const defaultRedirectionUrl = 'https://app.pix.fr/connexion';

  beforeEach(function () {
    emailValidationDemandRepository = {
      get: sinon.stub(),
      remove: sinon.stub(),
    };
    userRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };

    now = new Date('2024-06-26');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

    sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
  });

  afterEach(function () {
    clock.restore();
  });

  context('when token property is not given', function () {
    it('returns default redirection URL', async function () {
      // when
      const redirectionUrl = await validateUserAccountEmail({
        emailValidationDemandRepository,
      });

      // then
      expect(emailValidationDemandRepository.get).to.not.have.been.called;
      expect(emailValidationDemandRepository.remove).to.not.have.been.called;
      expect(redirectionUrl).to.equal(defaultRedirectionUrl);
    });

    it('returns the given redirection URL', async function () {
      // when
      const redirectionUrl = await validateUserAccountEmail({
        redirectUri: 'https://test.com',
        emailValidationDemandRepository,
      });

      // then
      expect(emailValidationDemandRepository.get).to.not.have.been.called;
      expect(emailValidationDemandRepository.remove).to.not.have.been.called;
      expect(redirectionUrl).to.equal('https://test.com');
    });
  });

  context('when the email validation demand does not exist', function () {
    it('returns default redirection URL', async function () {
      // given
      emailValidationDemandRepository.get.resolves(null);

      // when
      const redirectionUrl = await validateUserAccountEmail({
        token,
        emailValidationDemandRepository,
      });

      // then
      expect(emailValidationDemandRepository.get).to.have.been.calledWith(token);
      expect(emailValidationDemandRepository.remove).to.not.have.been.called;
      expect(redirectionUrl).to.equal(defaultRedirectionUrl);
    });

    it('returns the given redirection URL', async function () {
      // given
      emailValidationDemandRepository.get.resolves(null);

      // when
      const redirectionUrl = await validateUserAccountEmail({
        token,
        redirectUri: 'https://test.com',
        emailValidationDemandRepository,
      });

      // then
      expect(emailValidationDemandRepository.get).to.have.been.calledWith(token);
      expect(emailValidationDemandRepository.remove).to.not.have.been.called;
      expect(redirectionUrl).to.equal('https://test.com');
    });
  });

  context('when the email validation demand exists', function () {
    it('validates user email, removes the demand and returns a redirection url', async function () {
      // given
      const user = domainBuilder.buildUser({ id: 1, email: 'test@example.com' });
      const userUpdated = domainBuilder.buildUser({ id: 1, email: 'test@example.com', emailConfirmedAt: now });

      userRepository.get.resolves(user);
      userRepository.update.resolves();
      emailValidationDemandRepository.get.resolves(user.id);

      // when
      const redirectionUrl = await validateUserAccountEmail({
        token,
        emailValidationDemandRepository,
        userRepository,
      });

      // then
      expect(emailValidationDemandRepository.get).to.have.been.calledWith(token);
      expect(userRepository.get).to.have.been.calledWith(user.id);
      expect(userRepository.update).to.have.been.calledWith(userUpdated.mapToDatabaseDto());
      expect(emailValidationDemandRepository.remove).to.have.been.calledWith(token);
      expect(redirectionUrl).to.equal(defaultRedirectionUrl);
    });
  });

  context('when an error is thrown', function () {
    it('logs the error and redirect to default', async function () {
      // given
      userRepository.get.rejects(new Error('error'));
      userRepository.update.resolves();
      emailValidationDemandRepository.get.resolves('1');

      // when
      const redirectionUrl = await validateUserAccountEmail({
        token,
        emailValidationDemandRepository,
        userRepository,
      });

      // then
      expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWith({
        message: 'error',
        context: 'email-validation',
        data: { token },
        team: 'acces',
      });
      expect(redirectionUrl).to.equal(defaultRedirectionUrl);
    });
  });
});
