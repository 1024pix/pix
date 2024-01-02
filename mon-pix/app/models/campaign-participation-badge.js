import { attr, belongsTo } from '@ember-data/model';
import Badge from 'mon-pix/models/badge';

export default class CampaignParticipationBadge extends Badge {
  // attributes
  @attr('boolean') isAcquired;
  @attr('boolean') isAlwaysVisible;
  @attr('boolean') isCertifiable;
  @attr('boolean') isValid;
  @attr('number') acquisitionPercentage;

  // includes
  @belongsTo('campaignParticipationResult', {
    async: true,
    inverse: 'campaignParticipationBadges',
  })
  campaignParticipationResult;
}
