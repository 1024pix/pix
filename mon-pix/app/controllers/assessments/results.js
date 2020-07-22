import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Controller from '@ember/controller';

export default class ResultsController extends Controller {
  pageTitle = 'Fin de test de démo';

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
