import { PixBlock, PixButton } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import { DurationFormat } from '@formatjs/intl-durationformat';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import TimeoutGauge from 'mon-pix/components/timeout-gauge';

export default class TimedChallengeInstructions extends Component {
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

  <template>
    <PixBlock class="timed-challenge-instructions">
      <h1 class="timed-challenge-instructions__title">
        {{t "components.timed-challenge-instruction.primary" time=this.allocatedTime htmlSafe=true}}
      </h1>

      <p class="timed-challenge-instructions__description">
        {{t "components.timed-challenge-instruction.secondary"}}
      </p>

      <TimeoutGauge @allottedTime={{@time}} @fixedTime={{true}} class="timed-challenge-instructions__allocated-time" />

      <PixButton
        @triggerAction={{@hasUserConfirmedWarning}}
        class="timed-challenge-instructions__action"
        @variant="primary"
        @iconAfter="arrowRight"
      >
        {{t "components.timed-challenge-instruction.action"}}
      </PixButton>
    </PixBlock>
  </template>
}
