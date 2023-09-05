import Model, { attr } from '@ember-data/model';

export default class Course extends Model {
  @attr('string') description;
  @attr('string') name;
  @attr('number') nbChallenges;
}
