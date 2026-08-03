import sinon from 'sinon';

import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { mailService } from '../../../../../src/shared/domain/services/mail-service.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCase | send-email-for-account-recovery', function () {
  context('when email is available', function () {
    it('saves the account recovery demand', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const learner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id, nationalStudentId: '123' });
      await databaseBuilder.commit();

      sinon.stub(mailService, 'sendAccountRecoveryEmail');

      // when
      await usecases.sendEmailForAccountRecovery({
        studentInformation: {
          ineIna: learner.nationalStudentId,
          firstName: learner.firstName,
          lastName: learner.lastName,
          birthdate: learner.birthdate,
          email: 'new-email@example.net',
        },
        mailService,
      });

      // then
      const results = await knex('account-recovery-demands').where({ userId: user.id }).first();
      expect(results.oldEmail).to.equal(user.email);
      expect(results.newEmail).to.equal('new-email@example.net');
      expect(results.organizationLearnerId).to.equal(learner.id);

      expect(mailService.sendAccountRecoveryEmail).to.have.been.calledWith({
        firstName: learner.firstName,
        email: 'new-email@example.net',
        temporaryKey: results.temporaryKey,
      });
    });
  });
});
