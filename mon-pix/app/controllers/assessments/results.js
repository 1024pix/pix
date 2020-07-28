import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Controller from '@ember/controller';

@classic
export default class ResultsController extends Controller {
  isShowingModal = false;
  answer = null;

  @action
  openComparisonWindow(answer) {
    this.set('answer', answer);
    this.set('isShowingModal', true);
  }

  @action
  closeComparisonWindow() {
    this.set('isShowingModal', false);
  }
}
