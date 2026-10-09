import { PixBlock } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import CheckpointContinue from 'mon-pix/components/assessments/answer-button-continue';
import ResultItem from 'mon-pix/components/assessments/result-item';
export default class AnswerStatuses extends Component {
  get title() {
    return this.args.shouldDisplayAnswers
      ? 'pages.checkpoint.answers.header'
      : 'pages.checkpoint.answers.already-finished.info';
  }

  <template>
    <div class="answer-statuses">
      <h2 class="pix-title-xxs">{{t this.title}}</h2>

      {{#if @shouldDisplayAnswers}}
        {{#each @answers as |answer|}}
          <PixBlock>
            <ResultItem @answer={{answer}} @openAnswerDetails={{@openAnswerDetails}} />
          </PixBlock>
        {{/each}}
      {{else}}
        <PixBlock>
          <p class="answer-statuses__no-answer">
            {{t "pages.checkpoint.answers.already-finished.explanation.sentence1"}}
          </p>
          <p class="answer-statuses__no-answer">
            {{t "pages.checkpoint.answers.already-finished.explanation.sentence2"}}
          </p>
        </PixBlock>
      {{/if}}

      <CheckpointContinue @assessmentId={{@assessmentId}} @nextPageButtonText={{@nextPageButtonText}} />
    </div>
  </template>
}
