import Model, { attr } from '@ember-data/model';

export default class FeatureToggle extends Model {
  @attr('boolean') isNewAuthenticationDesignEnabled;
  @attr('boolean') isTextToSpeechButtonEnabled;
  @attr('boolean') showNewCampaignPresentationPage;
  @attr('boolean') isPixCompanionEnabled;
}
