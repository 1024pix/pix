import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class Focus extends Service {

  @tracked
  currentWindowHasFocus = true;
  assessment;

  start(assessment) {
    this.assessment = assessment;
    if (this.assessment.hasFocusedOutChallenge) {
      this.currentWindowHasFocus = false;
    } else {
      this._checkFocus();
    }
  }

  stop() {
    this.currentWindowHasFocus = true;
    clearTimeout(this.timeout);
  }

  _checkFocus() {
    this.currentWindowHasFocus = document.hasFocus();

    if (this.currentWindowHasFocus) {
      this.timeout = setTimeout(()=> {
        this._checkFocus();
      }, 1000);
    } else {
      this._saveFocusedOut();
      clearTimeout(this.timeout);
    }
  }

  async _saveFocusedOut() {
    await this.assessment.save({ adapterOptions: { updateLastQuestionsState: true, state: 'focusedout' } });
  }
}
