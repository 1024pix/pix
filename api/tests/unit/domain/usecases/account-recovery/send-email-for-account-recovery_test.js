const { sinon, expect, catchErr } = require('../../../../test-helper');
const sendEmailForAccountRecovery = require('../../../../../lib/domain/usecases/account-recovery/send-email-for-account-recovery.js');
const { AlreadyRegisteredEmailError } = require('../../../../../lib/domain/errors');
const AccountRecoveryDemand = require('../../../../../lib/domain/models/AccountRecoveryDemand');

describe('Unit | UseCase | Account-recovery | account-recovery | send-email-for-account-recovery', function () {
  let userRepository;
  let schoolingRegistrationRepository;
  let accountRecoveryDemandRepository;
  let scoAccountRecoveryService;
  let mailService;
  const userReconciliationService = {};

  beforeEach(function () {
    userRepository = {
      checkIfEmailIsAvailable: sinon.stub(),
      get: sinon.stub(),
    };
    schoolingRegistrationRepository = {
      getSchoolingRegistrationInformation: sinon.stub(),
    };
    accountRecoveryDemandRepository = {
      save: sinon.stub(),
    };
    scoAccountRecoveryService = {
      retrieveSchoolingRegistration: sinon.stub(),
    };
    mailService = {
      sendAccountRecoveryEmail: sinon.stub(),
    };
  });

  context('when email already exists', function () {
    it('should throw AlreadyRegisteredEmailError', async function () {
      // given
      userRepository.checkIfEmailIsAvailable.rejects(new AlreadyRegisteredEmailError());
      const newEmail = 'new_email@example.net';

      const studentInformation = {
        email: newEmail,
      };

      scoAccountRecoveryService.retrieveSchoolingRegistration
        .withArgs({
          accountRecoveryDemandRepository,
          studentInformation,
          schoolingRegistrationRepository,
          userRepository,
          userReconciliationService,
        })
        .resolves({
          username: 'nanou.monchose0705',
          email: 'nanou.monchose@example.net',
        });

      // when
      const error = await catchErr(sendEmailForAccountRecovery)({
        studentInformation,
        schoolingRegistrationRepository,
        userRepository,
        accountRecoveryDemandRepository,
        mailService,
        scoAccountRecoveryService,
        userReconciliationService,
      });

      // then
      expect(error).to.be.an.instanceOf(AlreadyRegisteredEmailError);
    });
  });

  context('when email is available', function () {
    it('should save the account recovery demand', async function () {
      // given
      const userId = 1;
      const oldEmail = 'old_email@example.net';
      const newEmail = 'NEW_EMAIL@example.net';
      const temporaryKey = '1234ADC';

      userRepository.checkIfEmailIsAvailable.resolves(true);
      accountRecoveryDemandRepository.save.resolves();
      mailService.sendAccountRecoveryEmail.resolves();

      const studentInformation = {
        email: newEmail,
      };

      scoAccountRecoveryService.retrieveSchoolingRegistration
        .withArgs({
          accountRecoveryDemandRepository,
          studentInformation,
          schoolingRegistrationRepository,
          userRepository,
          userReconciliationService,
        })
        .resolves({
          userId,
          username: 'nanou.monchose0705',
          email: oldEmail,
        });

      // when
      await sendEmailForAccountRecovery({
        studentInformation,
        temporaryKey,
        schoolingRegistrationRepository,
        userRepository,
        accountRecoveryDemandRepository,
        mailService,
        scoAccountRecoveryService,
        userReconciliationService,
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

    it('should send an account recovery email with schooling registration first name', async function () {
      // given
      const userId = 1;
      const oldEmail = 'old_email@example.net';
      const newEmail = 'NEW_EMAIL@example.net';
      const temporaryKey = '1234ADC';
      userRepository.checkIfEmailIsAvailable.resolves(true);
      accountRecoveryDemandRepository.save.resolves();

      const studentInformation = {
        email: newEmail,
      };

      scoAccountRecoveryService.retrieveSchoolingRegistration
        .withArgs({
          accountRecoveryDemandRepository,
          studentInformation,
          schoolingRegistrationRepository,
          userRepository,
          userReconciliationService,
        })
        .resolves({
          userId,
          firstName: 'Lorie',
          email: oldEmail,
        });

      // when
      await sendEmailForAccountRecovery({
        studentInformation,
        temporaryKey,
        schoolingRegistrationRepository,
        userRepository,
        accountRecoveryDemandRepository,
        mailService,
        scoAccountRecoveryService,
        userReconciliationService,
      });

      // then
      expect(mailService.sendAccountRecoveryEmail).to.have.been.calledWithExactly({
        firstName: 'Lorie',
        email: newEmail,
        temporaryKey,
      });
    });
  });
});
