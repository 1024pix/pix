import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

export default class Item extends Component {

  @service currentUser;

  constructor() {
    super(...arguments);
    if (this.isFocusedChallenge) {
      this._setOnBlurEventToWindow();
    }
  }

  @action
  hideOutOfFocusBorder() {
    if (this.isFocusedChallenge) {
      this.args.onFocusIntoChallenge();
    }
  }

  @action
  showOutOfFocusBorder() {
    if (this.isFocusedChallenge && !this.args.answer) {
      this.args.onFocusOutOfChallenge();
    }
  }

  _setOnBlurEventToWindow() {
    window.onblur = () => {
      this.args.onFocusOutOfWindow();
      this._clearOnBlurMethod();
    };
  }

  _clearOnBlurMethod() {
    window.onblur = null;
  }

  get isFocusedChallenge() {
    return ENV.APP.FT_FOCUS_CHALLENGE_ENABLED && this.args.challenge.focused;
  }
}
