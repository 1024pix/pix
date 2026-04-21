import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Prescription | Organization Learner | Domain | UseCase | unblockOrganizationLearnerAccount', function () {
  it('unblocks a blocked organization learner account', async function () {
    // given
    const blockedUserId = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod().id;
    databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
      externalIdentifier: 'samlId',
      userId: blockedUserId,
    });
    databaseBuilder.factory.buildUserLogin({
      blockedAt: new Date(Date.now() + 3600 * 1000),
      failureCount: 10,
      userId: blockedUserId,
    });

    const organizationId = databaseBuilder.factory.buildOrganization({
      type: 'SCO',
      isManagingStudents: true,
    }).id;
    const organizationLearnerId = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
      firstName: 'Blocked',
      lastName: 'User',
      userId: blockedUserId,
      organizationId,
    }).id;

    await databaseBuilder.commit();

    // when
    const result = await usecases.unblockOrganizationLearnerAccount({ organizationId, organizationLearnerId });

    // then
    expect(result.blockedAt).equal(null);
    expect(result.failureCount).equal(0);
  });

  it('unblocks a temporary blocked organization learner account', async function () {
    // given
    const temporaryBlockedUserId = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod().id;
    databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
      externalIdentifier: 'samlId',
      userId: temporaryBlockedUserId,
    });
    databaseBuilder.factory.buildUserLogin({
      temporaryBlockedUntil: new Date(Date.now() + 3600 * 1000),
      failureCount: 5,
      userId: temporaryBlockedUserId,
    });

    const organizationId = databaseBuilder.factory.buildOrganization({
      type: 'SCO',
      isManagingStudents: true,
    }).id;
    const organizationLearnerId = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
      firstName: 'Blocked',
      lastName: 'User',
      userId: temporaryBlockedUserId,
      organizationId,
    }).id;

    await databaseBuilder.commit();

    // when
    const result = await usecases.unblockOrganizationLearnerAccount({ organizationId, organizationLearnerId });

    // then
    expect(result.temporaryBlockedUntil).equal(null);
    expect(result.failureCount).equal(0);
  });
});
