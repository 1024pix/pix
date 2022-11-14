import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Controller from '@ember/controller';

export default class ResultsController extends Controller {
  @tracked isShowingModal = false;
  @tracked answer = {};

  @action
  async openComparisonWindow(answer) {
    this.answer = answer;
    await answer.correction;
    this.isShowingModal = true;
  }

  @action
  closeComparisonWindow() {
    this.isShowingModal = false;
  }
}
