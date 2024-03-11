import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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
