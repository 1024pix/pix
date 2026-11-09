import { PixIcon } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import { DurationFormat } from '@formatjs/intl-durationformat';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'mon-pix/config/environment';

const TICK_INTERVAL_IN_MILLISECONDS = 1000;

export default class TimeoutGauge extends Component {
  @tracked remainingSeconds;
  @tracked timer;
  @service locale;

  constructor() {
    super(...arguments);

    const allottedTimeInSeconds = this.args.allottedTime;
    if (this.args.hasTimeoutChallenge) {
      this.remainingSeconds = 0;
    } else {
      this.remainingSeconds = this._isNumeric(allottedTimeInSeconds) ? allottedTimeInSeconds : 0;
      if (!this.args.fixedTime) this._startTimer();
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this._stopTimer();
  }

  _startTimer() {
    if (ENV.APP.isTimerCountdownEnabled) {
      this.timer = setInterval(() => {
        this.remainingSeconds = this.remainingSeconds - 1;

        if (this.isTimedOut) {
          this.args.setChallengeAsTimedOut();
          this._stopTimer();
        }
      }, TICK_INTERVAL_IN_MILLISECONDS);
    }
  }

  _stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  get formattedRemainingTime() {
    if (this.args.fixedTime) {
      const minutes = Math.floor(this.remainingSeconds / 60);
      const seconds = this.remainingSeconds % 60;

      return new DurationFormat(this.locale.currentLanguage, { style: 'long' }).format({ minutes, seconds });
    }

    return this.remainingSeconds >= 0 ? this._formatMinutesAndSeconds(this.timeRemaining) : '0:00';
  }

  get timeRemaining() {
    if (this.remainingSeconds <= 0) {
      return { minutes: 0, seconds: 0 };
    }

    const seconds = this.remainingSeconds % 60;
    const minutes = (this.remainingSeconds - seconds) / 60;

    return {
      seconds,
      minutes,
    };
  }

  get isTimedOut() {
    return this.remainingSeconds <= 0;
  }

  _formatMinutesAndSeconds(data) {
    return data.minutes + (9 < data.seconds ? ':' : ':0') + data.seconds;
  }

  _isNumeric(value) {
    if (typeof value === 'number') return true;
    const str = (value || '').toString();
    if (!str) return false;
    return !isNaN(str);
  }

  <template>
    <span class="timeout-gauge{{if this.isTimedOut ' timeout-gauge--timeout'}}" tab-index="0" ...attributes>
      <PixIcon @name="time" />

      <span
        aria-label="{{t 'common.duration' minutes=this.timeRemaining.minutes seconds=this.timeRemaining.seconds}}"
      >{{this.formattedRemainingTime}}</span>
    </span>
  </template>
}
