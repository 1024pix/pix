import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Issue extends Component {
  @service router;

  @action
  async goToHome() {
    this.router.transitionTo('identified.missions');
  }
}
