import { action } from '@ember/object';
import Controller from '@ember/controller';

export default class TutorialController extends Controller {
  @action
  nextStep() {
    this.send('next');
  }

  @action
  ignoreTutorial() {
    this.send('submit');
  }
}
