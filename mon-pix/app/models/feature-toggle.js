import Model, { attr } from '@warp-drive/legacy/model';

export default class FeatureToggle extends Model {
  @attr('boolean') isTextToSpeechButtonEnabled;
  @attr('boolean') isQuestEnabled;
  @attr('boolean') isSurveyEnabledForCombinedCourses;
  @attr('boolean') areModuleShortIdUrlsEnabled;
  @attr('boolean') areCombinedCoursesEnabled;
  @attr('array') disabledLocalesInFrontend;
  @attr('boolean') isSessionLogoutEnabled;
}
