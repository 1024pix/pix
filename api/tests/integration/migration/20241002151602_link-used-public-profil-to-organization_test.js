import { up as migrationToTest } from '../../../db/migrations/20241002151602_link-used-public-profil-to-organization.js';
import { databaseBuilder, expect, knex } from '../../test-helper.js';

describe('Integration | Migration | 20241002151602_link-used-public-profil-to-organization', function () {
  let outdatedPublicTargetProfileId, activePublicTargetProfileId, organizationId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    outdatedPublicTargetProfileId = databaseBuilder.factory.buildTargetProfile({ outdated: true, isPublic: true }).id;
    activePublicTargetProfileId = databaseBuilder.factory.buildTargetProfile({ outdated: false, isPublic: true }).id;

    await databaseBuilder.commit();
  });

  it('should not link outdated public target profile to organization', async function () {
    // given
    databaseBuilder.factory.buildCampaign({
      targetProfileId: outdatedPublicTargetProfileId,
      organizationId,
    }).organizationId;

    await databaseBuilder.commit();

    // when
    await migrationToTest(knex);

    // then
    const patchedTargetProfilShare = await knex('target-profile-shares').where({
      organizationId,
      targetProfileId: outdatedPublicTargetProfileId,
    });

    expect(patchedTargetProfilShare).lengthOf(0);
  });

  it('should not link active public target profile to organization when not using it', async function () {
    // given
    databaseBuilder.factory.buildCampaign({
      targetProfileId: null,
      type: 'PROFILE_COLLECTION',
      organizationId,
    }).organizationId;

    await databaseBuilder.commit();

    // when
    await migrationToTest(knex);

    // then
    const patchedTargetProfilShare = await knex('target-profile-shares').where({
      organizationId,
      targetProfileId: outdatedPublicTargetProfileId,
    });

    expect(patchedTargetProfilShare).lengthOf(0);
  });

  it('should link active public target profile to organization using it', async function () {
    // given
    databaseBuilder.factory.buildCampaign({
      targetProfileId: activePublicTargetProfileId,
      organizationId,
    });
    databaseBuilder.factory.buildCampaign({
      targetProfileId: activePublicTargetProfileId,
      organizationId,
    });

    await databaseBuilder.commit();

    // when
    await migrationToTest(knex);

    // then
    const patchedTargetProfilShare = await knex('target-profile-shares').where({
      organizationId,
      targetProfileId: activePublicTargetProfileId,
    });

    expect(patchedTargetProfilShare).lengthOf(1);
  });

  it('should not throw on private linked target profile', async function () {
    // given
    const targetProfileId = databaseBuilder.factory.buildTargetProfile({ isPublic: false }).id;
    databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });
    databaseBuilder.factory.buildCampaign({
      targetProfileId,
      organizationId,
    });

    await databaseBuilder.commit();

    // when
    await migrationToTest(knex);

    // then
    const patchedTargetProfilShare = await knex('target-profile-shares').where({
      organizationId,
      targetProfileId,
    });

    expect(patchedTargetProfilShare).lengthOf(1);
  });

  it('should not throw on already linked target profile', async function () {
    // given
    databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId: activePublicTargetProfileId });
    databaseBuilder.factory.buildCampaign({
      targetProfileId: activePublicTargetProfileId,
      organizationId,
    });

    await databaseBuilder.commit();

    // when
    await migrationToTest(knex);

    // then
    const patchedTargetProfilShare = await knex('target-profile-shares').where({
      organizationId,
      targetProfileId: activePublicTargetProfileId,
    });

    expect(patchedTargetProfilShare).lengthOf(1);
  });

  it('should remove linked public target profile not used in organization', async function () {
    // given
    databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId: activePublicTargetProfileId });

    await databaseBuilder.commit();

    // when
    await migrationToTest(knex);

    // then
    const patchedTargetProfilShare = await knex('target-profile-shares').where({
      organizationId,
      targetProfileId: activePublicTargetProfileId,
    });

    expect(patchedTargetProfilShare).lengthOf(0);
  });
});
