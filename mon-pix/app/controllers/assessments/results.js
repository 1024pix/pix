import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class ResultsController extends Controller {
  @service intl;

  pageTitle = this.intl.t('pages.assessment-results.title');

  @tracked isShowingModal = false;
  @tracked answer = null;

  @action
  openComparisonWindow(answer) {
    this.answer = answer;
    this.isShowingModal = true;
  }

  @action
  closeComparisonWindow() {
    this.isShowingModal = false;
  }
}
