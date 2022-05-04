import Model, { attr } from '@ember-data/model';

export default class ComplementaryCertificationCourseResultsWithExternal extends Model {
  @attr('number') complementaryCertificationCourseId;
  @attr('string') pixResult;
  @attr('string') externalResult;
  @attr('string') finalResult;
}
