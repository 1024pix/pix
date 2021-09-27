import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ResultsController extends Controller {
  @service intl;

  get pageTitle() {
    return this.intl.t('pages.assessment-individual-results.title', {
      firstName: this.model.firstName,
      lastName: this.model.lastName,
    });
  }
}
