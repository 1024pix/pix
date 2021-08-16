import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class Focus extends Service {

  @tracked
  currentWindowHasFocus = true;

  start(hasFocusedOutOfChallenge = false) {
    this.currentWindowHasFocus = !hasFocusedOutOfChallenge;
    this._checkFocus();
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
    }
  }
}
