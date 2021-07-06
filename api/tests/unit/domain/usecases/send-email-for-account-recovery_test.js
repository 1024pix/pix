const { sinon, expect, catchErr, domainBuilder } = require('../../../test-helper');
const sendEmailForAccountRecovery = require('../../../../lib/domain/usecases/send-email-for-account-recovery.js');
const { AlreadyRegisteredEmailError } = require('../../../../lib/domain/errors');
const AccountRecoveryDemand = require('../../../../lib/domain/models/AccountRecoveryDemand');

describe('Unit | UseCase | send-email-for-account-recovery', () => {

  let userRepository;
  let accountRecoveryDemandRepository;
  let mailService;

  beforeEach(() => {
    userRepository = {
      isEmailAvailable: sinon.stub(),
      get: sinon.stub(),
    };
    accountRecoveryDemandRepository = {
      save: sinon.stub(),
    };
    mailService = {
      sendAccountRecoveryEmail: sinon.stub(),
    };
  });

  context('when email already exists', ()=> {

    it('should throw AlreadyRegisteredEmailError', async () => {
      // given
      userRepository.isEmailAvailable.rejects(new AlreadyRegisteredEmailError());
      const newEmail = 'new_email@example.net';

      // when
      const error = await catchErr(sendEmailForAccountRecovery)({
        email: newEmail,
        userRepository,
        accountRecoveryDemandRepository,
        mailService,
      });

      // then
      expect(error).to.be.an.instanceOf(AlreadyRegisteredEmailError);
    });
  });

  context('when email is available', ()=> {

    it('should save the account recovery demand', async () => {
      // given
      const userId = 1;
      const oldEmail = 'old_email@example.net';
      const newEmail = 'NEW_EMAIL@example.net';
      const temporaryKey = '1234ADC';
      const user = domainBuilder.buildUser({
        userId,
        email: oldEmail,
      });
      userRepository.isEmailAvailable.resolves(true);
      userRepository.get.resolves(user);
      accountRecoveryDemandRepository.save.resolves();
      mailService.sendAccountRecoveryEmail.resolves();

      // when
      await sendEmailForAccountRecovery({
        email: newEmail,
        userId,
        temporaryKey,
        userRepository,
        accountRecoveryDemandRepository,
        mailService,
      });

      // then
      const expectedAccountRecoveryDemand = new AccountRecoveryDemand({
        userId,
        oldEmail,
        newEmail: 'new_email@example.net',
        temporaryKey,
        used: false,
      });
      expect(accountRecoveryDemandRepository.save).to.have.been.calledWithExactly(expectedAccountRecoveryDemand);
    });

    it('should send an account recovery email', async () => {
      // given
      const userId = 1;
      const oldEmail = 'old_email@example.net';
      const newEmail = 'NEW_EMAIL@example.net';
      const temporaryKey = '1234ADC';
      const user = domainBuilder.buildUser({
        userId,
        email: oldEmail,
      });
      userRepository.isEmailAvailable.resolves(true);
      userRepository.get.resolves(user);
      accountRecoveryDemandRepository.save.resolves();

      // when
      await sendEmailForAccountRecovery({
        email: newEmail,
        userId,
        temporaryKey,
        userRepository,
        accountRecoveryDemandRepository,
        mailService,
      });

      // then
      expect(mailService.sendAccountRecoveryEmail).to.have.been.calledWithExactly({
        firstName: user.firstName,
        locale: 'fr-fr',
        temporaryKey,
      });
    });
  });
});
