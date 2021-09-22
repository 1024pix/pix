import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

export default class Item extends Component {

  @service currentUser;
  @service focus;
  @tracked hasFocusedOutOfChallenge = false;

  constructor() {
    super(...arguments);
    if (this.isFocusedChallenge) {
      this.focus.start(this.args.assessment);
    }
  }

  willDestroy() {
    this.focus.stop();
    super.willDestroy(...arguments);
  }

  @action
  hideOutOfFocusBorder() {
    if (this.isFocusedChallenge) {
      this.args.onFocusIntoChallenge();
      this.hasFocusedOutOfChallenge = false;
    }
  }

  @action
  showOutOfFocusBorder() {
    if (this.isFocusedChallenge && !this.args.answer) {
      this.args.onFocusOutOfChallenge();
      this.hasFocusedOutOfChallenge = true;
    }
  }

  @action
  enableFocusedChallenge() {
    this.isTooltipClosed = true;
    this.args.onTooltipClose();
  }

  get isFocusedChallenge() {
    return ENV.APP.FT_FOCUS_CHALLENGE_ENABLED && this.args.challenge.focused;
  }

  get hasFocusedOutOfWindow() {
    return !this.focus.currentWindowHasFocus;
  }
}
