import Model, { attr } from '@ember-data/model';

export default class FeatureToggle extends Model {
  @attr('boolean') isTextToSpeechButtonEnabled;
  @attr('boolean') isQuestEnabled;
  @attr('boolean') isSurveyEnabledForCombinedCourses;
  @attr('boolean') areModuleShortIdUrlsEnabled;
  @attr('array') disabledLocalesInFrontend;
  @attr('boolean') addEmailConnectionMethodEnabled;
  @attr('array') userCertificationsActionsDisabledFrameworks;
}
