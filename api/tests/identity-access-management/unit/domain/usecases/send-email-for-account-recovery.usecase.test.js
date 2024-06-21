import { AlreadyRegisteredEmailError } from '../../../../../lib/domain/errors.js';
import { AccountRecoveryDemand } from '../../../../../src/identity-access-management/domain/models/AccountRecoveryDemand.js';
import { sendEmailForAccountRecovery } from '../../../../../src/identity-access-management/domain/usecases/send-email-for-account-recovery.usecase.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | send-email-for-account-recovery', function () {
  let userRepository;
  let organizationLearnerRepository;
  let accountRecoveryDemandRepository;
  let scoAccountRecoveryService;
  let mailService;
  const userReconciliationService = {};

  beforeEach(function () {
    userRepository = {
      checkIfEmailIsAvailable: sinon.stub(),
      get: sinon.stub(),
    };
    organizationLearnerRepository = {
      getOrganizationLearnerInformation: sinon.stub(),
    };
    accountRecoveryDemandRepository = {
      save: sinon.stub(),
    };
    scoAccountRecoveryService = {
      retrieveOrganizationLearner: sinon.stub(),
    };
    mailService = {
      sendAccountRecoveryEmail: sinon.stub(),
    };
  });

  context('when email already exists', function () {
    it('throws AlreadyRegisteredEmailError', async function () {
      // given
      userRepository.checkIfEmailIsAvailable.rejects(new AlreadyRegisteredEmailError());
      const newEmail = 'new_email@example.net';

      const studentInformation = {
        email: newEmail,
      };

      scoAccountRecoveryService.retrieveOrganizationLearner
        .withArgs({
          accountRecoveryDemandRepository,
          studentInformation,
          organizationLearnerRepository,
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
        organizationLearnerRepository,
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
    it('saves the account recovery demand', async function () {
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

      scoAccountRecoveryService.retrieveOrganizationLearner
        .withArgs({
          accountRecoveryDemandRepository,
          studentInformation,
          organizationLearnerRepository,
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
        organizationLearnerRepository,
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

    it('sends an account recovery email with organization learner first name', async function () {
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

      scoAccountRecoveryService.retrieveOrganizationLearner
        .withArgs({
          accountRecoveryDemandRepository,
          studentInformation,
          organizationLearnerRepository,
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
        organizationLearnerRepository,
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
