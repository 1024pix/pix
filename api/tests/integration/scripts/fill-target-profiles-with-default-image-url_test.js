import { fillTargetProfilesWithDefaultImageUrl } from '../../../scripts/fill-target-profiles-with-default-image-url.js';
import { databaseBuilder, expect, knex } from '../../test-helper.js';

describe('Integration | Script | fillTargetProfilesWithDefaultImageUrl', function () {
  it('should fill target profiles with default image url', async function () {
    // given
    const targetProfileWithoutImageUrl = databaseBuilder.factory.buildTargetProfile({ imageUrl: null });
    const targetProfileWithImageUrl = databaseBuilder.factory.buildTargetProfile({
      imageUrl: 'https://example.net/image.png',
    });
    await databaseBuilder.commit();

    // when
    await fillTargetProfilesWithDefaultImageUrl();

    // then
    const updatedTargetProfile = await knex('target-profiles')
      .where({ id: targetProfileWithoutImageUrl.id })
      .first('imageUrl');
    expect(updatedTargetProfile.imageUrl).to.equal('https://images.pix.fr/profil-cible/Illu_GEN.svg');

    const notUpdatedTargetProfile = await knex('target-profiles')
      .where({ id: targetProfileWithImageUrl.id })
      .first('imageUrl');
    expect(notUpdatedTargetProfile.imageUrl).to.equal('https://example.net/image.png');
  });
});
