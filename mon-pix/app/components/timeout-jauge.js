import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/string';
import { run } from '@ember/runloop';
import round from 'lodash/round';
import ENV from 'mon-pix/config/environment';

const TICK_INTERVAL = 1000;

const BLACK_JAUGE_ICON_PATH = '/images/icon-timeout-black.svg';
const RED_JAUGE_ICON_PATH = '/images/icon-timeout-red.svg';

export default class TimeoutJauge extends Component {

  _timer = null;
  _elapsedTime = null;
  _currentTime = Date.now();

  constructor() {
    super(...arguments);
    this._start();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this._stop();
  }

  _start() {
    this._stop();
    this._currentTime = Date.now();
    this._tick();
  }

  _stop() {
    const _timer = this._timer;

    if (_timer) {
      run.cancel(_timer);
      this._timer = null;
    }
  }

  _tick() {
    if (ENV.APP.isTimerCountdownEnabled) {

      const now = Date.now();

      this._elapsedTime = this._elapsedTime + (now - this._currentTime);
      this._currentTime = now;
      this._timer = run.later(this, this._tick, TICK_INTERVAL);
    }
  }

  get remainingTime() {
    return this.remainingSeconds >= 0 ? this._formatToMinutesAndSeconds(this.remainingSeconds) : '0:00';
  }

  get percentageOfTimeout() {
    const actualAllottedTime = this.args.allottedTime;
    if (this._isNumeric(actualAllottedTime) && parseInt(actualAllottedTime) >= 1) {
      return 100 - (this.remainingSeconds / actualAllottedTime) * 100;
    } else {
      return 0;
    }
  }

  get remainingSeconds() {
    return round((this._totalTime() - this._elapsedTime) / 1000);
  }

  _totalTime() {
    const actualAllottedTime = this.args.allottedTime;
    return this._isNumeric(actualAllottedTime) ? 1000 * actualAllottedTime : 0;
  }

  get jaugeWidthStyle() {
    return htmlSafe(`width: ${this.percentageOfTimeout}%`);
  }

  get hasFinished() {
    return this.remainingSeconds <= 0;
  }

  get imageSource() {
    return this.hasFinished ? RED_JAUGE_ICON_PATH : BLACK_JAUGE_ICON_PATH;
  }

  _formatToMinutesAndSeconds(seconds) {
    return (seconds - (seconds %= 60)) / 60 + (9 < seconds ? ':' : ':0') + seconds;
  }

  _isNumeric(value) {
    if (typeof value === 'number') return true;
    const str = (value || '').toString();
    if (!str) return false;
    return !isNaN(str);
  }
}
