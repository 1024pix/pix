import Model, { attr, belongsTo } from '@ember-data/model';

export default class Training extends Model {
  @attr('string') status;
  @attr('string') title;
  @attr('string') link;
  @attr('string') type;
  @attr('string') locale;
  @attr('string') editorName;
  @attr('string') editorLogoUrl;
  @attr() duration;

  @belongsTo('campaign-participation', { async: true, inverse: 'trainings' }) campaignParticipation;

  get isAutoformation() {
    return this.type === 'autoformation';
  }
}
