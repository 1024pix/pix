import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class LevelsPerTube extends Model {
  @attr('string') competenceId;
  @attr('number') maxLevel;
  @attr('number') meanLevel;
  @attr('string') description;
  @attr('string') title;

  @belongsTo('levels-per-competence', { async: false, inverse: null })
  levelsPerCompetence;
}
