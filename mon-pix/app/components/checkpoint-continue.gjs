import { PixButtonLink, PixIcon } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

export default class CheckpointContinue extends Component {
  <template>
    <div class="checkpoint__continue">
      <PixButtonLink
        @route="assessments.resume"
        @model={{@assessmentId}}
        @query={{this.query}}
        @variant="primary-bis"
        class="checkpoint__continue-button"
      >
        {{@nextPageButtonText}}
        <PixIcon @name="arrowRight" @ariaHidden={{true}} />
      </PixButtonLink>
    </div>
  </template>
  get query() {
    return {
      hasSeenCheckpoint: true,
    };
  }
}
