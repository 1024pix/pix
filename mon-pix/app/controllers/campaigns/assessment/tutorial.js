import Controller from '@ember/controller';
import { action } from '@ember/object';

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
