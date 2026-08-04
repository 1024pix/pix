import sinon from 'sinon';

import { InvalidOrAlreadyUsedEmailError } from '../../../../../src/identity-access-management/domain/errors.js';
import { AccountRecoveryDemand } from '../../../../../src/identity-access-management/domain/models/AccountRecoveryDemand.js';
import { AccountRecoveryService } from '../../../../../src/identity-access-management/domain/services/account-recovery.service.js';
import { accountRecoveryDemandRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/account-recovery-demand.repository.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { AccountRecoveryDemandExpired, UserHasAlreadyLeftSCO } from '../../../../../src/shared/domain/errors.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | Service | account-recovery-service', function () {
  let accountRecoveryService;

  beforeEach(function () {
    accountRecoveryService = new AccountRecoveryService({
      userRepository,
      accountRecoveryDemandRepository,
      cryptoService,
    });
  });

  describe('createRecoveryDemand', function () {
    it('creates a recovery demand', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const learner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id });
      await databaseBuilder.commit();

      // when
      const result = await accountRecoveryService.createRecoveryDemand({
        userId: user.id,
        newEmail: 'new-email@example.com',
        organizationLearnerId: learner.id,
      });

      // then
      expect(result).to.be.instanceOf(AccountRecoveryDemand);
      expect(result.id).to.be.a('number');
      expect(result.organizationLearnerId).to.equal(learner.id);
      expect(result.userId).to.equal(user.id);
      expect(result.oldEmail).to.equal(user.email);
      expect(result.newEmail).to.equal('new-email@example.com');
      expect(result.temporaryKey).to.be.a('string');
      expect(result.used).to.be.false;
    });

    describe('when user has already recovered its account', function () {
      it('throws an error', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const learner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id });
        databaseBuilder.factory.buildAccountRecoveryDemand({
          userId: user.id,
          organizationLearnerId: learner.id,
          used: true,
        });
        await databaseBuilder.commit();

        // when / then
        await expect(
          accountRecoveryService.createRecoveryDemand({
            userId: user.id,
            newEmail: 'new-email@example.com',
            organizationLearnerId: learner.id,
          }),
        ).to.be.rejectedWith(UserHasAlreadyLeftSCO);
      });
    });

    describe('when new email is already used', function () {
      it('throws an error', async function () {
        // given
        const userWithExistingEmail = databaseBuilder.factory.buildUser({ email: 'new-email@example.com' });
        const user = databaseBuilder.factory.buildUser();
        const learner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id });
        await databaseBuilder.commit();

        // when / then
        await expect(
          accountRecoveryService.createRecoveryDemand({
            userId: user.id,
            newEmail: userWithExistingEmail.email,
            organizationLearnerId: learner.id,
          }),
        ).to.be.rejectedWith(InvalidOrAlreadyUsedEmailError);
      });
    });
  });

  describe('getRecoveryDemand', function () {
    it('gets a recovery demand', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const learner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id });
      const recoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({
        userId: user.id,
        organizationLearnerId: learner.id,
        newEmail: 'new-email@example.com',
        oldEmail: 'old-email@example.com',
      });
      await databaseBuilder.commit();

      // when
      const result = await accountRecoveryService.getRecoveryDemand(recoveryDemand.temporaryKey);

      // then
      expect(result).to.be.instanceOf(AccountRecoveryDemand);
      expect(result.id).to.be.a('number');
      expect(result.organizationLearnerId).to.equal(learner.id);
      expect(result.userId).to.equal(user.id);
      expect(result.oldEmail).to.equal('old-email@example.com');
      expect(result.newEmail).to.equal('new-email@example.com');
      expect(result.temporaryKey).to.be.a('string');
      expect(result.used).to.be.false;
    });

    describe('when recovery demand has expired', function () {
      it('throws an error', async function () {
        // given
        sinon.useFakeTimers({ now: new Date('2022-01-03') });
        const user = databaseBuilder.factory.buildUser();
        const learner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id });
        const recoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({
          userId: user.id,
          organizationLearnerId: learner.id,
          createdAt: new Date('2021-01-01'),
        });
        await databaseBuilder.commit();

        // when / then
        await expect(accountRecoveryService.getRecoveryDemand(recoveryDemand.temporaryKey)).to.be.rejectedWith(
          AccountRecoveryDemandExpired,
        );
      });
    });

    describe('when user has already recovered its account', function () {
      it('throws an error', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const learner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id });
        databaseBuilder.factory.buildAccountRecoveryDemand({
          userId: user.id,
          organizationLearnerId: learner.id,
          used: true,
        });
        const recoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({
          userId: user.id,
          organizationLearnerId: learner.id,
          temporaryKey: 'temp2',
        });
        await databaseBuilder.commit();

        // when / then
        await expect(accountRecoveryService.getRecoveryDemand(recoveryDemand.temporaryKey)).to.be.rejectedWith(
          UserHasAlreadyLeftSCO,
        );
      });
    });

    describe('when new email is already used', function () {
      it('throws an error', async function () {
        // given
        const userWithExistingEmail = databaseBuilder.factory.buildUser({ email: 'new-email@example.com' });
        const user = databaseBuilder.factory.buildUser();
        const learner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id });
        const recoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({
          userId: user.id,
          organizationLearnerId: learner.id,
          newEmail: userWithExistingEmail.email,
        });
        await databaseBuilder.commit();

        // when / then
        await expect(accountRecoveryService.getRecoveryDemand(recoveryDemand.temporaryKey)).to.be.to.be.rejectedWith(
          InvalidOrAlreadyUsedEmailError,
        );
      });
    });
  });
});
