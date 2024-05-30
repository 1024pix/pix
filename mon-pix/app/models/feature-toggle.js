import Model, { attr } from '@ember-data/model';

export default class FeatureToggle extends Model {
  @attr areV3InfoScreensEnabled;
  @attr('boolean') isTextToSpeechButtonEnabled;
}
