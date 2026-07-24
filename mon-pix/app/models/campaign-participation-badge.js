import { attr, belongsTo } from '@warp-drive/legacy/model';
import Badge from 'mon-pix/models/badge';

export default class CampaignParticipationBadge extends Badge {
  // attributes
  @attr('boolean') isAcquired;
  @attr('boolean') isAlwaysVisible;
  @attr('boolean') isCertifiable;
  @attr('boolean') isValid;
  @attr('number') acquisitionPercentage;

  // includes
  @belongsTo('campaign-participation-result', {
    async: true,
    inverse: 'campaignParticipationBadges',
  })
  campaignParticipationResult;
}
