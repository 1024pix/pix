import Model, { attr, hasMany } from '@ember-data/model';

export default class CampaignPresentationStep extends Model {
  @attr('string') customLandingPageText;

  @hasMany('badge', { async: false, inverse: null }) badges;
  @hasMany('competence', { async: false, inverse: null }) competences;
}
