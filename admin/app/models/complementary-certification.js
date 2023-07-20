import Model, { attr } from '@ember-data/model';

export default class ComplementaryCertification extends Model {
  @attr() key;
  @attr() label;
  @attr() currentTargetProfile;
}
