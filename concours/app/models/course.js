import Model, { attr } from '@ember-data/model';

export default class Course extends Model {

  // attributes
  @attr('string') description;
  @attr('string') imageUrl;
  @attr('string') name;
  @attr('number') nbChallenges;
}
