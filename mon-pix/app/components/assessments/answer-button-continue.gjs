import { PixButtonLink } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

export default class AnswerButtonContinue extends Component {
  <template>
    <div class="answer-button-continue">
      <PixButtonLink
        @route="assessments.resume"
        @model={{@assessmentId}}
        @query={{this.query}}
        @variant="primary"
        @iconAfter="arrowRight"
      >
        {{@nextPageButtonText}}
      </PixButtonLink>
    </div>
  </template>
  get query() {
    return {
      hasSeenCheckpoint: true,
    };
  }
}
