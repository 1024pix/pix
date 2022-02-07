import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class UserTutorialsController extends Controller {
  @service intl;
  @service featureToggles;

  get showNewTutorialsPage() {
    return this.featureToggles.featureToggles.isNewTutorialsPageEnabled;
  }
}
