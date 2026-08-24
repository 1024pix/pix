import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import formatTime from 'ember-intl/helpers/format-time';
import { lt } from 'ember-truth-helpers';

import formatDuration from '../../../helpers/format-duration';
import { assessmentStates } from '../../../models/certification';
import { AnswerStatus } from '../../../models/certification-challenges-for-administration';
import { subcategoryToCode, subcategoryToLabel } from '../../../models/certification-issue-report';
import { abortReasons } from '../../../models/v3-certification-course-details-for-administration';

const successColor = 'success';
const errorColor = 'error';
const neutralColor = 'neutral';
const secondaryColor = 'secondary';
const tertiaryColor = 'tertiary';

const abortReasonMap = {
  [abortReasons.CANDIDATE]: 'pages.certifications.certification.details.v3.abort-reason.candidate',
  [abortReasons.TECHNICAL]: 'pages.certifications.certification.details.v3.abort-reason.technical',
};

const answerStatusMap = [
  {
    value: AnswerStatus.OK,
    label: 'pages.certifications.certification.details.v3.answer-status.ok',
    color: successColor,
  },
  {
    value: AnswerStatus.KO,
    label: 'pages.certifications.certification.details.v3.answer-status.ko',
    color: neutralColor,
  },
  {
    value: null,
    label: 'pages.certifications.certification.details.v3.answer-status.validated-live-alert',
    color: errorColor,
  },
  {
    value: AnswerStatus.ABAND,
    label: 'pages.certifications.certification.details.v3.answer-status.aband',
    color: tertiaryColor,
  },
  {
    value: AnswerStatus.TIMEDOUT,
    label: 'pages.certifications.certification.details.v3.answer-status.timedout',
    color: secondaryColor,
  },
  {
    value: AnswerStatus.FOCUSEDOUT,
    label: 'pages.certifications.certification.details.v3.answer-status.focused-out',
    color: secondaryColor,
  },
  {
    value: AnswerStatus.UNIMPLEMENTED,
    label: 'pages.certifications.certification.details.v3.answer-status.unimplemented',
    color: secondaryColor,
  },
];

const assessmentResultStatusLabelAndColor = (status) => ({
  label: `pages.certifications.certification.details.v3.assessment-result-status.${status}`,
  color: status === 'validated' ? successColor : errorColor,
});

const assessmentStateMap = {
  [assessmentStates.ENDED_BY_INVIGILATOR]: {
    label: 'pages.certifications.certification.details.v3.assessment-state.ended-by-invigilator',
    color: secondaryColor,
  },
  [assessmentStates.ENDED_DUE_TO_FINALIZATION]: {
    label: 'pages.certifications.certification.details.v3.assessment-state.ended-due-to-finalization',
    color: tertiaryColor,
  },
  [assessmentStates.ENDED_DUE_TO_DURATION_EXCEEDED]: {
    label: 'pages.certifications.certification.details.v3.assessment-state.ended-due-to-finalization',
    color: tertiaryColor,
  },
};

export default class DetailsV3 extends Component {
  @tracked showModal = false;
  @tracked certificationChallenge = null;
  @tracked modalTitle = 'pages.certifications.certification.details.v3.live-alert-modal.title.report';
  @tracked modalContent = null;
  @tracked subCategory = null;

  twentyFourHoursInMs = 24 * 60 * 60 * 1000;

  answerStatusLabel(status) {
    return answerStatusMap.find((option) => option.value === status).label;
  }

  answerStatusColor(status) {
    return answerStatusMap.find((option) => option.value === status).color;
  }

  get detailStatusLabel() {
    const { assessmentResultStatus, isRejectedForFraud } = this.args.details;
    if (isRejectedForFraud) {
      return assessmentResultStatusLabelAndColor('fraud').label;
    }
    return assessmentResultStatusLabelAndColor(assessmentResultStatus).label;
  }

  get detailStatusColor() {
    const { assessmentResultStatus, isRejectedForFraud } = this.args.details;
    if (isRejectedForFraud) {
      return assessmentResultStatusLabelAndColor('fraud').color;
    }

    return assessmentResultStatusLabelAndColor(assessmentResultStatus).color;
  }

  shouldDisplayAnswerStatus(certificationChallenge) {
    return !!certificationChallenge.validatedLiveAlert || !!certificationChallenge.answeredAt;
  }

  shouldDisplayAnswerValueIcon(certificationChallenge) {
    return (
      certificationChallenge.answerStatus !== 'aband' &&
      certificationChallenge.answerStatus !== null &&
      !certificationChallenge.validatedLiveAlert
    );
  }

  externalUrlForPreviewChallenge(challengeId) {
    return `https://app.pix.fr/challenges/${challengeId}/preview`;
  }

  externalUrlForPixEditor(challengeId) {
    return `https://editor.pix.fr/challenge/${challengeId}`;
  }

  get durationTagColor() {
    return this.args.details.hasExceededTimeLimit ? errorColor : successColor;
  }

  get shouldDisplayEndedByBlock() {
    return this.args.details.hasNotBeenCompletedByCandidate;
  }

  get endedByLabel() {
    return assessmentStateMap[this.args.details.assessmentState].label;
  }

  get certificationEndedByTagColor() {
    return assessmentStateMap[this.args.details.assessmentState].color;
  }

  get abortReasonLabel() {
    return abortReasonMap[this.args.details.abortReason];
  }

  get lastAnswerDate() {
    return this.args.details.lastAnswerAt;
  }

  get lastAnswerDateTooltipContent() {
    if (this.args.details.wasEndedByInvigilator) {
      return 'pages.certifications.certification.details.v3.last-answer-date-tooltip.ended-by-invigilator';
    }
    if (this.args.details.wasFinalized) {
      return 'pages.certifications.certification.details.v3.last-answer-date-tooltip.ended-due-to-finalization';
    }
    return null;
  }

  @action
  openModal(certificationChallenge) {
    this.showModal = true;
    this.certificationChallenge = certificationChallenge;
    this.modalTitle = `pages.certifications.certification.details.v3.live-alert-modal.title.${
      this._isReportedQuestion() ? 'report' : 'answer'
    }`;
    this.modalContent = this._isReportedQuestion()
      ? subcategoryToLabel[this.certificationChallenge.validatedLiveAlert.issueReportSubcategory]
      : this.certificationChallenge.answerValue;
    this.subCategory = subcategoryToCode[this.certificationChallenge.validatedLiveAlert.issueReportSubcategory];
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  _isReportedQuestion() {
    return this.certificationChallenge.validatedLiveAlert;
  }

  <template>
    <div class="certification-details-v3__container">
      <section class="page-section">
        <div class="certification-details-v3-header" id="general-informations">
          <h2 class="certification-details-v3__title">
            {{@details.title}}
          </h2>
          {{#if @details.assessmentResultStatus}}
            <PixTag data-testid="pw-certification-general-information-status-tag" @color={{this.detailStatusColor}}>{{t
                this.detailStatusLabel
              }}</PixTag>
          {{/if}}
        </div>
        <dl
          class="certification-details-v3__list"
          aria-labelledby="general-informations"
          data-testid="pw-certification-general-information-description-list"
        >
          <dt id="creation-date">
            {{t "pages.certifications.certification.details.v3.general-informations.labels.created-at"}}
            :
          </dt>
          <dd aria-labelledby="creation-date">
            {{formatDate @details.createdAt format="long"}}
          </dd>
          {{#if this.lastAnswerDate}}
            <dt id="last-answer-date">
              {{t "pages.certifications.certification.details.v3.general-informations.labels.last-answer-at"}}
              :
            </dt>
            <dd aria-labelledby="last-answer-date">
              <PixTooltip @isWide={{true}}>
                <:triggerElement>
                  <span tabindex="0" class="certification-details-v3-list__last-answer-date">
                    {{formatDate this.lastAnswerDate format="long"}}
                  </span>
                </:triggerElement>
                <:tooltip>
                  {{#if this.lastAnswerDateTooltipContent}}
                    {{t this.lastAnswerDateTooltipContent}}
                  {{/if}}
                </:tooltip>
              </PixTooltip>
              {{#if (lt @details.duration this.twentyFourHoursInMs)}}
                <PixTag @color={{this.durationTagColor}}>{{formatDuration @details.duration "HHhmm"}}</PixTag>
              {{else}}
                <PixTag @color={{this.durationTagColor}}> > 24h</PixTag>
              {{/if}}
            </dd>
          {{/if}}

          {{#if this.shouldDisplayEndedByBlock}}
            <dt id="ended-by">
              {{t "pages.certifications.certification.details.v3.general-informations.labels.ended-by"}}
              :
            </dt>
            <dd aria-labelledby="ended-by">
              <PixTag @color={{this.certificationEndedByTagColor}}>{{t this.endedByLabel}}</PixTag>
            </dd>
          {{/if}}

          {{#if @details.abortReason}}
            <dt id="abort-reason">
              {{t "pages.certifications.certification.details.v3.general-informations.labels.abort-reason"}}
              :
            </dt>
            <dd aria-labelledby="abort-reason">{{t this.abortReasonLabel}}</dd>
          {{/if}}

          <dt id="results">
            {{t "pages.certifications.certification.details.v3.general-informations.labels.result"}}
            :
          </dt>
          <dd aria-labelledby="results">{{@details.result}}</dd>
        </dl>
      </section>
      <section class="page-section">
        <h2 class="certification-details-v3__title" id="more-informations">
          {{t "pages.certifications.certification.details.v3.more-informations.title"}}
        </h2>

        <dl
          class="certification-details-v3__list"
          aria-labelledby="more-informations"
          role="list"
          data-testid="pw-certification-more-information-description-list"
        >
          <dt>
            {{t "pages.certifications.certification.details.v3.more-informations.labels.numberof-answered-questions"}}
            /
            {{t "pages.certifications.certification.details.v3.more-informations.labels.total-numberof-questions"}}
          </dt>
          <dd>{{@details.numberOfAnsweredQuestions}}/{{@details.numberOfChallenges}}</dd>
          <dt>{{t "pages.certifications.certification.details.v3.more-informations.labels.numberof-ok-questions"}}
            :</dt>
          <dd>{{@details.numberOfOkAnswers}}</dd>
          <dt>{{t "pages.certifications.certification.details.v3.more-informations.labels.numberof-ko-questions"}}
            :</dt>
          <dd>{{@details.numberOfKoAnswers}}</dd>
          <dt>{{t "pages.certifications.certification.details.v3.more-informations.labels.numberof-aband-answers"}}
            :</dt>
          <dd>{{@details.numberOfAbandAnswers}}</dd>
          <dt>{{t
              "pages.certifications.certification.details.v3.more-informations.labels.numberof-validated-live-alerts"
            }}
            :</dt>
          <dd>{{@details.numberOfValidatedLiveAlerts}}</dd>
        </dl>
      </section>
    </div>
    <section class="page-section">
      <h2 class="certification-details-v3__title">
        {{t "pages.certifications.certification.details.v3.questions-list.title"}}
      </h2>
      <PixTable
        @variant="admin"
        @caption={{t "pages.certifications.certification.details.v3.questions-list.caption"}}
        @data={{@details.certificationChallengesForAdministration}}
      >
        <:columns as |certificationChallenge context|>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.certifications.certification.details.v3.questions-list.labels.number"}}
            </:header>
            <:cell>
              {{certificationChallenge.questionNumber}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.certifications.certification.details.v3.questions-list.labels.answered-at"}}
            </:header>
            <:cell>
              {{#if certificationChallenge.answeredAt}}
                <time>
                  {{formatTime certificationChallenge.answeredAt format="long"}}
                </time>
              {{else}}
                -
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.certifications.certification.details.v3.questions-list.labels.answer-status"}}
            </:header>
            <:cell>
              {{#if (this.shouldDisplayAnswerStatus certificationChallenge)}}
                <PixTag @color={{this.answerStatusColor certificationChallenge.answerStatus}}>
                  {{t (this.answerStatusLabel certificationChallenge.answerStatus)}}
                </PixTag>
              {{else}}
                -
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.certifications.certification.details.v3.questions-list.labels.competence"}}
            </:header>
            <:cell>
              {{certificationChallenge.competenceIndex}}
              {{certificationChallenge.competenceName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.certifications.certification.details.v3.questions-list.labels.skill"}}
            </:header>
            <:cell>
              {{certificationChallenge.skillName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="certification-details-v3-table__challenge-information-cell">
            <:header>
              {{t "pages.certifications.certification.details.v3.questions-list.labels.challenge-id"}}
            </:header>
            <:cell>
              <a
                href={{this.externalUrlForPixEditor certificationChallenge.id}}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={{t
                  "pages.certifications.certification.details.v3.questions-list.actions.informations.extra-information"
                }}
              >
                {{certificationChallenge.id}}
                <PixIcon @name="openNew" />
              </a>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="certification-details-v3-table__challenge-action-cell">
            <:header>
              {{t "pages.certifications.certification.details.v3.questions-list.labels.actions"}}
            </:header>
            <:cell>
              <a
                href={{this.externalUrlForPreviewChallenge certificationChallenge.id}}
                target="_blank"
                title={{t
                  "pages.certifications.certification.details.v3.questions-list.actions.challenge-preview.label"
                }}
                aria-label={{t
                  "pages.certifications.certification.details.v3.questions-list.actions.challenge-preview.extra-information"
                }}
                rel="noopener noreferrer"
              >
                <PixIcon @name="eye" @plainIcon={{true}} />
              </a>
              {{#if certificationChallenge.validatedLiveAlert}}
                <PixIconButton
                  @ariaLabel={{t
                    "pages.certifications.certification.details.v3.questions-list.actions.display-live-alert.extra-information"
                  }}
                  @triggerAction={{fn this.openModal certificationChallenge}}
                  @iconName="warning"
                />
              {{/if}}

              {{#if (this.shouldDisplayAnswerValueIcon certificationChallenge)}}
                <PixIconButton
                  @ariaLabel={{t
                    "pages.certifications.certification.details.v3.questions-list.actions.display-answer.extra-information"
                  }}
                  @triggerAction={{fn this.openModal certificationChallenge}}
                  @iconName="chat"
                />
              {{/if}}
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    </section>

    <PixModal
      @title="{{t this.modalTitle}} question {{this.certificationChallenge.questionNumber}}"
      @showModal={{this.showModal}}
      @onCloseButtonClick={{this.closeModal}}
    >
      <:content>
        {{#if this.certificationChallenge.validatedLiveAlert}}
          <span class="certification-details-v3-modal__live-alert-subcategory">{{this.subCategory}}</span>
        {{/if}}
        <p>
          {{this.modalContent}}
        </p>
      </:content>
      <:footer>
        <PixButton @variant="secondary" @triggerAction={{this.closeModal}}>
          {{t "common.actions.close"}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
