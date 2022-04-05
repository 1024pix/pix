import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

const LOCAL_STORAGE_KEY = 'hasConfirmedFocusChallengeScreen';

export default class FocusedCertificationChallengeWarningManager extends Service {
  _localStorage = window.localStorage;

  @tracked _hasConfirmedFocusChallengeScreen;

  constructor() {
    super(...arguments);
    this._hasConfirmedFocusChallengeScreen = JSON.parse(this._localStorage.getItem(LOCAL_STORAGE_KEY)) || false;
  }

  reset() {
    this._hasConfirmedFocusChallengeScreen = false;
    this._localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  setToConfirmed() {
    this._hasConfirmedFocusChallengeScreen = true;
    this._localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this._hasConfirmedFocusChallengeScreen));
  }

  hasConfirmed() {
    return this._hasConfirmedFocusChallengeScreen;
  }
}
