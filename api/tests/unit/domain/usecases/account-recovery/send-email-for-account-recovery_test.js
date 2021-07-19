const { sinon, expect, catchErr, domainBuilder } = require('../../../../test-helper');
const sendEmailForAccountRecovery = require('../../../../../lib/domain/usecases/send-email-for-account-recovery.js');
const { AlreadyRegisteredEmailError } = require('../../../../../lib/domain/errors');
const AccountRecoveryDemand = require('../../../../../lib/domain/models/AccountRecoveryDemand');

describe('Unit | UseCase | Account-recovery | send-email-for-account-recovery', () => {

  let userRepository;
  let schoolingRegistrationRepository;
  let accountRecoveryDemandRepository;
  let mailService;

  beforeEach(() => {
    userRepository = {
      isEmailAvailable: sinon.stub(),
      get: sinon.stub(),
    };
    schoolingRegistrationRepository = {
      getSchoolingRegistrationInformation: sinon.stub(),
    };
    accountRecoveryDemandRepository = {
      save: sinon.stub(),
    };
    mailService = {
      sendAccountRecoveryEmail: sinon.stub(),
    };
  });

  context('when email already exists', () => {

    it('should throw AlreadyRegisteredEmailError', async () => {
      // given
      userRepository.isEmailAvailable.rejects(new AlreadyRegisteredEmailError());
      const newEmail = 'new_email@example.net';
      schoolingRegistrationRepository.getSchoolingRegistrationInformation.resolves({});
      userRepository.get.resolves({ email: newEmail });

      const studentInformation = {
        email: newEmail,
      };

      // when
      const error = await catchErr(sendEmailForAccountRecovery)({
        studentInformation,
        schoolingRegistrationRepository,
        userRepository,
        accountRecoveryDemandRepository,
        mailService,
      });

      // then
      expect(error).to.be.an.instanceOf(AlreadyRegisteredEmailError);
    });
  });

  context('when email is available', () => {

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
      schoolingRegistrationRepository.getSchoolingRegistrationInformation.resolves({ userId });
      userRepository.isEmailAvailable.resolves(true);
      userRepository.get.resolves(user);
      accountRecoveryDemandRepository.save.resolves();
      mailService.sendAccountRecoveryEmail.resolves();

      const studentInformation = {
        email: newEmail,
      };

      // when
      await sendEmailForAccountRecovery({
        studentInformation,
        temporaryKey,
        schoolingRegistrationRepository,
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

    it('should send an account recovery email with schooling registration first name', async () => {
      // given
      const userId = 1;
      const oldEmail = 'old_email@example.net';
      const newEmail = 'NEW_EMAIL@example.net';
      const temporaryKey = '1234ADC';
      const user = domainBuilder.buildUser({
        userId,
        email: oldEmail,
      });
      const schoolingRegistration = {
        firstName: 'Lorie',
      };
      schoolingRegistrationRepository.getSchoolingRegistrationInformation.resolves(schoolingRegistration);
      userRepository.isEmailAvailable.resolves(true);
      userRepository.get.resolves(user);
      accountRecoveryDemandRepository.save.resolves();

      const studentInformation = {
        email: newEmail,
      };

      // when
      await sendEmailForAccountRecovery({
        studentInformation,
        temporaryKey,
        schoolingRegistrationRepository,
        userRepository,
        accountRecoveryDemandRepository,
        mailService,
      });

      // then
      expect(mailService.sendAccountRecoveryEmail).to.have.been.calledWithExactly({
        firstName: schoolingRegistration.firstName,
        email: newEmail,
        temporaryKey,
      });
    });
  });
});
