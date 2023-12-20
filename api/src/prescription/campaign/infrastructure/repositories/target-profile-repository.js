import * as targetProfileAdapter from '../../../../../lib/infrastructure/adapters/target-profile-adapter.js';
import { BookshelfTargetProfile } from '../../../../../lib/infrastructure/orm-models/TargetProfile.js';

const getByCampaignId = async function (campaignId) {
  const bookshelfTargetProfile = await BookshelfTargetProfile.query((qb) => {
    qb.innerJoin('campaigns', 'campaigns.targetProfileId', 'target-profiles.id');
  })
    .where({ 'campaigns.id': campaignId })
    .fetch({
      withRelated: ['badges'],
    });
  return targetProfileAdapter.fromDatasourceObjects({
    bookshelfTargetProfile,
  });
};

export { getByCampaignId };
