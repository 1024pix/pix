import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/string';
import ENV from 'mon-pix/config/environment';

const BLACK_GAUGE_ICON_PATH = '/images/icon-timeout-black.svg';
const RED_GAUGE_ICON_PATH = '/images/icon-timeout-red.svg';

const TICK_INTERVAL_IN_MILLISECONDS = 1000;

export default class TimeoutGauge extends Component {

  @tracked remainingSeconds;
  _timer;

  constructor() {
    super(...arguments);

    const allottedTimeInSeconds = this.args.allottedTime;
    this.remainingSeconds = this._isNumeric(allottedTimeInSeconds) ? allottedTimeInSeconds : 0;

    this._startTimer();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this._stopTimer();
  }

  _startTimer() {
    if (ENV.APP.isTimerCountdownEnabled) {
      this._timer = setInterval(() => {
        this.remainingSeconds = this.remainingSeconds - 1;

        if (this._isTimedOut()) {
          this.args.setChallengeAsTimedOut();
          this._stopTimer();
        }
      }, TICK_INTERVAL_IN_MILLISECONDS);
    }
  }

  _stopTimer() {
    if (this._timer) {
      clearInterval(this._timer);
    }
  }

  get formattedRemainingTime() {
    return this.remainingSeconds >= 0 ? this._formatToMinutesAndSeconds(this.remainingSeconds) : '0:00';
  }

  get gaugeWidthStyle() {
    return htmlSafe(`width: ${this.percentageOfTimeout}%`);
  }

  get percentageOfTimeout() {
    const actualAllottedTime = this.args.allottedTime;
    if (this._isNumeric(actualAllottedTime) && parseInt(actualAllottedTime) >= 1) {
      return 100 - (this.remainingSeconds / actualAllottedTime) * 100;
    } else {
      return 0;
    }
  }

  get imageSource() {
    return this._isTimedOut() ? RED_GAUGE_ICON_PATH : BLACK_GAUGE_ICON_PATH;
  }

  _isTimedOut() {
    return this.remainingSeconds <= 0;
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
