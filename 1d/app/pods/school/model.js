import Model, { attr } from '@ember-data/model';

export default class School extends Model {
  @attr name;
  @attr code;
  @attr organizationLearners;
}
