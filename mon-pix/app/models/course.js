import Model, { attr } from '@warp-drive/legacy/model';

export default class Course extends Model {
  @attr('string') description;
  @attr('string') name;
  @attr('number') nbChallenges;
}
