import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class CampaignsAssessmentSkillReviewController extends Controller {
  @service featureToggles;

  get showNewResultPage() {
    return this.featureToggles.featureToggles?.showNewResultPage;
  }
}
