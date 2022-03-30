import Model, { attr } from '@ember-data/model';

export default class FeatureToggle extends Model {
  @attr('boolean') isEndTestScreenRemovalEnabled;
  @attr('boolean') isNewTutorialsPageEnabled;
}
