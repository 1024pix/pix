import Model, { attr } from '@warp-drive/legacy/model';

export default class Mission extends Model {
  @attr('string') name;
  @attr('string') competenceName;
  @attr('string') startedBy;
  @attr('string') learningObjectives;
  @attr('string') documentationUrl;
  @attr content;
}
