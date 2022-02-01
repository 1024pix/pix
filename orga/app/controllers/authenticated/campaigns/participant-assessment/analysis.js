import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class AnalysisController extends Controller {
  @service intl;

  get pageTitle() {
    return this.intl.t('pages.campaign-individual-review.title', {
      firstName: this.model.firstName,
      lastName: this.model.lastName,
    });
  }
}
