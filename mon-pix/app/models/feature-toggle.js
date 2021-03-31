import Model, { attr } from '@ember-data/model';

export default class FeatureToggle extends Model {
  @attr('boolean') certifPrescriptionSco;
  @attr('boolean') isPoleEmploiEnabled;
  @attr('boolean') isAprilFoolEnabled;

}
