import { StudentInformationForAccountRecovery } from '../../../../../src/identity-access-management/domain/read-models/StudentInformationForAccountRecovery.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | UseCase | check-sco-account-recovery', function () {
  it('should return user account information', async function () {
    // given
    const user = databaseBuilder.factory.buildUser({ email: 'email@example.net', username: 'username' });
    const organization = databaseBuilder.factory.buildOrganization();
    const learner = databaseBuilder.factory.buildOrganizationLearner({
      userId: user.id,
      organizationId: organization.id,
      nationalStudentId: '123',
    });
    await databaseBuilder.commit();

    // when
    const result = await usecases.checkScoAccountRecovery({
      studentInformation: {
        ineIna: learner.nationalStudentId,
        firstName: learner.firstName,
        lastName: learner.lastName,
        birthdate: learner.birthdate,
      },
    });

    // then
    expect(result).to.be.instanceof(StudentInformationForAccountRecovery);
    expect(result).to.deep.equal(
      new StudentInformationForAccountRecovery({
        firstName: learner.firstName,
        lastName: learner.lastName,
        username: user.username,
        email: user.email,
        latestOrganizationName: organization.name,
      }),
    );
  });
});
