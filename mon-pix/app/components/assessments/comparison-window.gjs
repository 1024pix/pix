import { PixModal } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import ChallengeIllustration from 'mon-pix/components/challenge-illustration';
import FeedbackPanel from 'mon-pix/components/feedback-panel';
import LearningMorePanel from 'mon-pix/components/learning-more-panel';
import MarkdownToHtmlUnsafe from 'mon-pix/components/markdown-to-html-unsafe';
import QcmSolutionPanel from 'mon-pix/components/solution-panel/qcm-solution-panel';
import QcuSolutionPanel from 'mon-pix/components/solution-panel/qcu-solution-panel';
import QrocSolutionPanel from 'mon-pix/components/solution-panel/qroc-solution-panel';
import QrocmDepSolutionPanel from 'mon-pix/components/solution-panel/qrocm-dep-solution-panel';
import QrocmIndSolutionPanel from 'mon-pix/components/solution-panel/qrocm-ind-solution-panel';
import TutorialPanel from 'mon-pix/components/tutorial-panel';

const TRANSLATION_PREFIX = 'pages.comparison-window.results.';
const TEXT_FOR_RESULT = {
  ok: { status: 'ok' },
  ko: { status: 'ko' },
  aband: { status: 'aband' },
  timedout: { status: 'timedout' },
  focusedOut: { status: 'ko' },
  okAutoReply: { status: 'ok' },
  koAutoReply: { status: 'ko' },
  abandAutoReply: { status: 'aband' },
  default: { status: 'default' },
};

function _getTextForResult(result) {
  return {
    status: TEXT_FOR_RESULT[result].status,
    title: `${TRANSLATION_PREFIX}${result}.title`,
    tooltip: `${TRANSLATION_PREFIX}${result}.tooltip`,
  };
}

export default class ComparisonWindow extends Component {
  <template>
    <PixModal
      class="comparison-window"
      @title={{t this.resultItem.title}}
      @onCloseButtonClick={{@closeComparisonWindow}}
      @showModal={{@showModal}}
    >
      <:content>
        <div class="comparison-window-content__body">

          <div class="comparison-window-content-body__instruction">
            <div class="rounded-panel__row">
              <MarkdownToHtmlUnsafe
                @class="challenge-statement-instruction__text"
                @markdown={{@answer.challenge.instruction}}
              />
            </div>

            {{#if @answer.challenge.illustrationUrl}}
              <div class="rounded-panel__row challenge-statement__illustration-section">
                <ChallengeIllustration
                  @src={{@answer.challenge.illustrationUrl}}
                  @alt={{@answer.challenge.illustrationAlt}}
                />
              </div>
            {{/if}}
          </div>
          <div>
            {{#if this.isAssessmentChallengeTypeQcm}}
              <QcmSolutionPanel
                @challenge={{@answer.challenge}}
                @answer={{@answer}}
                @solution={{this.solution}}
                @solutionToDisplay={{this.solutionToDisplay}}
              />
            {{/if}}

            {{#if this.isAssessmentChallengeTypeQcu}}
              <QcuSolutionPanel
                @challenge={{@answer.challenge}}
                @answer={{@answer}}
                @solution={{this.solution}}
                @solutionToDisplay={{this.solutionToDisplay}}
              />
            {{/if}}

            {{#if this.isAssessmentChallengeTypeQroc}}
              <div data-test-id="comparison-window__corrected-answers--qroc">
                <QrocSolutionPanel
                  @answer={{@answer}}
                  @solution={{this.solution}}
                  @solutionToDisplay={{this.solutionToDisplay}}
                />
              </div>
            {{/if}}

            {{#if this.isAssessmentChallengeTypeQrocmInd}}
              <div data-test-id="comparison-window__corrected-answers--qrocm">
                <QrocmIndSolutionPanel
                  @answer={{@answer}}
                  @solution={{this.solution}}
                  @challenge={{@answer.challenge}}
                  @solutionToDisplay={{this.solutionToDisplay}}
                />
              </div>
            {{/if}}

            {{#if this.isAssessmentChallengeTypeQrocmDep}}
              <div data-test-id="comparison-window__corrected-answers--qrocm">
                <QrocmDepSolutionPanel
                  @answer={{@answer}}
                  @solution={{this.solution}}
                  @challenge={{@answer.challenge}}
                  @solutionToDisplay={{this.solutionToDisplay}}
                  @answersEvaluation={{this.answersEvaluation}}
                  @solutionsWithoutGoodAnswers={{this.solutionsWithoutGoodAnswers}}
                />
              </div>
            {{/if}}
          </div>

          {{#if @answer.isResultNotOk}}
            {{#if @answer.correction.noHintsNorTutorialsAtAll}}
              <p class="comparison-windows-content-body-default-message-container__default-message-title">{{t
                  "pages.comparison-window.upcoming-tutorials"
                }}</p>
            {{else}}
              <TutorialPanel @hint={{@answer.correction.hint}} @tutorials={{@answer.correction.tutorials}} />
            {{/if}}
          {{/if}}
          <LearningMorePanel @learningMoreTutorials={{@answer.correction.learningMoreTutorials}} />
        </div>
      </:content>
      <:footer>
        {{#if @showModal}}
          <FeedbackPanel
            @assessment={{@answer.assessment}}
            @challenge={{@answer.challenge}}
            @context="comparison-window"
            @answer={{@answer}}
          />
        {{/if}}
      </:footer>
    </PixModal>
  </template>
  get isAssessmentChallengeTypeQroc() {
    return this.args.answer.challenge?.get('type') === 'QROC';
  }

  get isAssessmentChallengeTypeQcm() {
    return this.args.answer.challenge?.get('type') === 'QCM';
  }

  get isAssessmentChallengeTypeQcu() {
    return this.args.answer.challenge?.get('type') === 'QCU';
  }

  get isAssessmentChallengeTypeQrocm() {
    return this.args.answer.challenge?.get('type') === 'QROCM';
  }

  get isAssessmentChallengeTypeQrocmInd() {
    return this.args.answer.challenge?.get('type') === 'QROCM-ind';
  }

  get isAssessmentChallengeTypeQrocmDep() {
    return this.args.answer.challenge?.get('type') === 'QROCM-dep';
  }

  get answerSuffix() {
    return this._isAutoReply ? 'AutoReply' : '';
  }

  get resultItem() {
    if (!this.args.answer) {
      return '';
    }

    const answerStatus = `${this.args.answer.result}${this.answerSuffix}`;

    if (answerStatus && answerStatus in TEXT_FOR_RESULT) {
      return _getTextForResult(answerStatus);
    }

    return _getTextForResult('default');
  }

  get solution() {
    return this._isAutoReply ? null : this.args.answer.correction.get('solution');
  }

  get answersEvaluation() {
    return this.args.answer.correction.get('answersEvaluation');
  }

  get solutionsWithoutGoodAnswers() {
    return this.args.answer.correction.get('solutionsWithoutGoodAnswers');
  }

  get solutionToDisplay() {
    return this.args.answer.correction.get('solutionToDisplay');
  }

  get _isAutoReply() {
    return Boolean(this.args.answer.challenge?.get('autoReply'));
  }
}
