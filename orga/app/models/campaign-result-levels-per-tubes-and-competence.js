import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class CampaignResultLevelsPerTubesAndCompetence extends Model {
  @attr('number') maxReachableLevel;
  @attr('number') meanReachedLevel;
  @attr levelsPerTube;

  @hasMany('levels-per-competence', { async: false, inverse: null }) levelsPerCompetence;
}
