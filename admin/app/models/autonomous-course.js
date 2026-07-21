import Model, { attr } from '@warp-drive/legacy/model';
export default class AutonomousCourse extends Model {
  @attr('string') internalTitle;
  @attr('string') publicTitle;
  @attr('string') targetProfileId;
  @attr('nullable-string') customLandingPageText;
  @attr code;
  @attr createdAt;
}
