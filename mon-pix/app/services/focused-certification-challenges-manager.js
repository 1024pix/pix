import Service from '@ember/service';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';

const LOCAL_STORAGE_KEY = 'focusedCertificationsChallenges';

export default class FocusedCertificationChallengesManager extends Service {
  _localStorage = window.localStorage;

  @tracked _focusedCertificationsChallenges;

  constructor() {
    super(...arguments);
    this._focusedCertificationsChallenges = JSON.parse(this._localStorage.getItem(LOCAL_STORAGE_KEY)) || A([]);
  }

  clear() {
    this._focusedCertificationsChallenges = A([]);
    this._localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  add(challengeId) {
    this._focusedCertificationsChallenges.pushObject(challengeId);
    this._localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this._focusedCertificationsChallenges));
  }

  has(challengeId) {
    return this._focusedCertificationsChallenges.some((id) => id === challengeId);
  }
}
