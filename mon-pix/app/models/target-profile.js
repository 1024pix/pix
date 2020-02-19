import Model, { attr } from '@ember-data/model';

export default class TargetProfile extends Model {

  // attributes
  @attr('string') name;
}
