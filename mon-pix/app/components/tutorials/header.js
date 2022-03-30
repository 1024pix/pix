import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class Header extends Component {
  @service router;

  get isRecommended() {
    return this._isActive('user-tutorials-v2.recommended');
  }
  get isSaved() {
    return this._isActive('user-tutorials-v2.saved');
  }
  _isActive(route) {
    return route === this.router.currentRouteName ? 'grey' : 'transparent-light';
  }
}
