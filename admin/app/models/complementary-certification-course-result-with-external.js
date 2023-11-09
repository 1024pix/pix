import Model, { attr } from '@ember-data/model';

export default class complementaryCertificationCourseResultWithExternal extends Model {
  @attr('number') complementaryCertificationCourseId;
  @attr('string') pixResult;
  @attr('string') externalResult;
  @attr('string') finalResult;
  @attr() allowedExternalLevels;
  @attr() defaultJuryOptions;

  get isExternalResultEditable() {
    return this.pixResult !== 'Rejetée';
  }
}
