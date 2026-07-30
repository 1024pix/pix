import Model, { attr, belongsTo, hasMany } from '@warp-drive/legacy/model';

export default class LevelsPerCompetence extends Model {
  @attr('string') index;
  @attr('number') maxLevel;
  @attr('number') meanLevel;
  @attr('string') name;
  @attr('string') description;

  @belongsTo('campaign-analysis-by-tubes-and-competence', { async: false, inverse: null })
  campaignAnalysisBytubesAndCompetences;
  @belongsTo('campaign-participation-levels-per-tubes-and-competence', { async: false, inverse: null })
  campaignParticipationLevelsPerTubesAndCompetence;
  @hasMany('levels-per-tube', { async: false, inverse: null }) levelsPerTube;
}
