import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { service } from '@ember/service';
import { DurationFormat } from '@formatjs/intl-durationformat';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class TimedChallengeInstructions extends Component {
  <template>
    <div class="rounded-panel rounded-panel--no-margin-bottom timed-challenge-instructions">
      <h1 class="timed-challenge-instructions__primary">
        {{t "pages.timed-challenge-instructions.primary" time=this.allocatedTime htmlSafe=true}}
      </h1>

      <p class="timed-challenge-instructions__secondary">
        {{t "pages.timed-challenge-instructions.secondary"}}
      </p>

      <div class="timed-challenge-instructions__allocated-time">
        <PixIcon @name="time" @ariaHidden={{true}} class="timed-challenge-instructions-allocated-time__icon" />
        <span>{{this.allocatedTime}}</span>
      </div>

      <PixButton
        @triggerAction={{@hasUserConfirmedWarning}}
        class="timed-challenge-instructions-action__confirmation-button"
        @variant="success"
      >
        {{t "pages.timed-challenge-instructions.action"}}
      </PixButton>
    </div>
  </template>
  @service intl;
  @service locale;

  get allocatedTime() {
    const time = this.args.time;

    if (!Number.isInteger(time)) {
      return '';
    }

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return new DurationFormat(this.locale.currentLanguage, { style: 'long' }).format({ minutes, seconds });
  }
}
