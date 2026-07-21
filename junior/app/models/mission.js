import Model, { attr } from '@warp-drive/legacy/model';

export default class Mission extends Model {
  @attr('string') name;
  @attr('string') areaCode;
  @attr('string') learningObjectives;
  @attr('string') validatedObjectives;
  @attr('string') introductionMediaUrl;
  @attr('string') introductionMediaType;
  @attr('string') introductionMediaAlt;
  @attr('string') cardImageUrl;
}
