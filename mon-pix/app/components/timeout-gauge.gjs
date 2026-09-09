import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'mon-pix/config/environment';

const TICK_INTERVAL_IN_MILLISECONDS = 1000;

export default class TimeoutGauge extends Component {
  @tracked remainingSeconds;
  @tracked timer;

  constructor() {
    super(...arguments);

    const allottedTimeInSeconds = this.args.allottedTime;
    if (this.args.hasTimeoutChallenge) {
      this.remainingSeconds = 0;
    } else {
      this.remainingSeconds = this._isNumeric(allottedTimeInSeconds) ? allottedTimeInSeconds : 0;
      this._startTimer();
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

  get gaugeWidthStyle() {
    return htmlSafe(
      `background: linear-gradient(to right, var(--pix-neutral-100) ${this.percentageOfTimeout}%, transparent ${this.percentageOfTimeout}%);`,
    );
  }

  get percentageOfTimeout() {
    const actualAllottedTime = this.args.allottedTime;
    if (this.remainingSeconds <= 0) {
      return 100;
    } else if (this._isNumeric(actualAllottedTime) && parseInt(actualAllottedTime) >= 1) {
      return 100 - (this.remainingSeconds / actualAllottedTime) * 100;
    } else {
      return 0;
    }
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
    <div class="timeout-gauge" tab-index="0">
      <div class="timeout-gauge__content" style={{this.gaugeWidthStyle}}>
        <PixIcon @name="time" class={{if this.isTimedOut "timeout-gauge__stop-icon"}} />

        <span
          aria-label="{{t 'common.duration' minutes=this.timeRemaining.minutes seconds=this.timeRemaining.seconds}}"
        >
          <span aria-hidden="true">{{this.formattedRemainingTime}}</span>
        </span>
      </div>
    </div>
  </template>
}
