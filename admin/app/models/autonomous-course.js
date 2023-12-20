import Model, { attr } from '@ember-data/model';
export default class AutonomousCourse extends Model {
  @attr('string') internalTitle;
  @attr('string') publicTitle;
  @attr('string') targetProfileId;
  @attr('nullable-string') customLandingPageText;
  @attr code;
  @attr createdAt;
}
