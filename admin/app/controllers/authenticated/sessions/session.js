import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';

export default class SessionController extends Controller {
  @service router;

  @tracked inputId;

  @action
  loadSession(event) {
    event.preventDefault();
    const sessionId = _.trim(this.inputId);
    const routeName = this.router.currentRouteName;
    this.router.transitionTo(routeName, sessionId);
  }
}
