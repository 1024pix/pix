import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

export default class Item extends Component {

  @service currentUser;
  @tracked hasFocusedOutOfWindow = false;
  @tracked hasFocusedOutOfChallenge = false;
  @tracked isTooltipClosed = false;

  @action
  hideOutOfFocusBorder() {
    if (this.isFocusedChallenge && this.isTooltipClosed) {
      this.args.onFocusIntoChallenge();
      this.hasFocusedOutOfChallenge = false;
    }
  }

  @action
  showOutOfFocusBorder() {
    if (this.isFocusedChallenge && this.isTooltipClosed && !this.args.answer) {
      this.args.onFocusOutOfChallenge();
      this.hasFocusedOutOfChallenge = true;
    }
  }

  @action
  enableFocusedChallenge() {
    this.isTooltipClosed = true;
    this._setOnBlurEventToWindow();
    this.args.onTooltipClose();
  }

  _setOnBlurEventToWindow() {
    window.onblur = () => {
      this.hasFocusedOutOfWindow = true;
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
