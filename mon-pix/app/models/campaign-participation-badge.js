/* eslint ember/no-computed-properties-in-native-classes: 0 */

import { attr, belongsTo, hasMany } from '@ember-data/model';
import { mapBy, max } from '@ember/object/computed';
import Badge from 'mon-pix/models/badge';

export default class CampaignParticipationBadge extends Badge {

  // attributes
  @attr('boolean') isAcquired;

  // includes
  @hasMany('partnerCompetenceResult') partnerCompetenceResults;
  @belongsTo('campaignParticipationResult') campaignParticipationResult;

  // methods
  @mapBy('partnerCompetenceResults', 'totalSkillsCount') totalPartnerCompetenceResultSkillsCounts;
  @max('totalPartnerCompetenceResultSkillsCounts') maxTotalSkillsCountInPartnerCompetences;
}
