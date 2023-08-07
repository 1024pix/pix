import Model, { attr } from '@ember-data/model';

export default class AttachableTargetProfile extends Model {
  @attr('string') name;
}
