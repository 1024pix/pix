import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | check-target-profile-belongs-to-organization', function () {
  it('should return true when the target profile belongs to the organization', async function () {
    // given
    const organization = databaseBuilder.factory.buildOrganization();
    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    databaseBuilder.factory.buildTargetProfileShare({
      organizationId: organization.id,
      targetProfileId: targetProfile.id,
    });
    await databaseBuilder.commit();

    // when
    const result = await usecases.checkTargetProfileBelongsToOrganization({
      targetProfileId: targetProfile.id,
      organizationId: organization.id,
    });

    // then
    expect(result).to.be.true;
  });

  it('should return false when the target profile does not belong to the organization', async function () {
    // given
    const organization = databaseBuilder.factory.buildOrganization();
    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    await databaseBuilder.commit();

    // when
    const result = await usecases.checkTargetProfileBelongsToOrganization({
      targetProfileId: targetProfile.id,
      organizationId: organization.id,
    });

    // then
    expect(result).to.be.false;
  });

  it('should return false when the target profile does exists', async function () {
    // given
    const organization = databaseBuilder.factory.buildOrganization();
    await databaseBuilder.commit();

    // when
    const result = await usecases.checkTargetProfileBelongsToOrganization({
      targetProfileId: 123,
      organizationId: organization.id,
    });

    // then
    expect(result).to.be.false;
  });
});
