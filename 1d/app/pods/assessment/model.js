import Model, { attr, hasMany } from '@ember-data/model';

export default class Assessment extends Model {
  // attributes
  @attr('string') certificationNumber;
  @attr('string') codeCampaign;
  @attr('string') state;
  @attr('string') title;
  @attr('string') type;
  @attr('string') lastQuestionState;
  @attr('string') method;

  // references
  @attr('string') competenceId;
  @attr('string') missionId;
  @hasMany('activity', { async: true, inverse: 'assessment' }) activities;
}
