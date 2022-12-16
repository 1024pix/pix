import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class MenuBar extends Component {
  @service session;
  @service currentUser;
  @service accessControl;

  @action
  logout() {
    return this.session.invalidate();
  }
}
