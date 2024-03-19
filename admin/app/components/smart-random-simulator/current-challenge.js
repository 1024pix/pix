import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class CurrentChallenge extends Component {
  @action
  getNextChallenge() {
    this.args.getNextChallenge();
  }
}
