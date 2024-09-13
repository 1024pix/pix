import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import { lt } from 'ember-truth-helpers';

import DayjsFormatDuration from '../../../helpers/dayjs-format-duration';
import { AnswerStatus } from '../../../models/certification-challenges-for-administration';
import { subcategoryToCode, subcategoryToLabel } from '../../../models/certification-issue-report';
import { abortReasons, assessmentStates } from '../../../models/v3-certification-course-details-for-administration';

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
  [assessmentStates.ENDED_BY_SUPERVISOR]: {
    label: 'pages.certifications.certification.details.v3.assessment-state.ended-by-supervisor',
    color: secondaryColor,
  },
  [assessmentStates.ENDED_DUE_TO_FINALIZATION]: {
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
    const { assessmentResultStatus, isCancelled, isRejectedForFraud } = this.args.details;
    if (isCancelled) {
      return assessmentResultStatusLabelAndColor('cancelled').label;
    }
    if (isRejectedForFraud) {
      return assessmentResultStatusLabelAndColor('fraud').label;
    }
    return assessmentResultStatusLabelAndColor(assessmentResultStatus).label;
  }

  get detailStatusColor() {
    const { assessmentResultStatus, isCancelled, isRejectedForFraud } = this.args.details;
    if (isCancelled) {
      return assessmentResultStatusLabelAndColor('cancelled').color;
    }
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

  get completionDate() {
    return this.args.details.completedAt || this.args.details.endedAt;
  }

  get completionDateTooltipContent() {
    if (this.args.details.wasEndedBySupervisor) {
      return 'pages.certifications.certification.details.v3.completion-date-tooltip.ended-by-supervisor';
    }
    if (this.args.details.wasFinalized) {
      return 'pages.certifications.certification.details.v3.completion-date-tooltip.ended-due-to-finalization';
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
            {{t
              "pages.certifications.certification.details.v3.general-informations.title"
              certificationCourseId=@details.certificationCourseId
            }}
          </h2>
          {{#if @details.assessmentResultStatus}}
            <PixTag @color={{this.detailStatusColor}}>{{t this.detailStatusLabel}}</PixTag>
          {{/if}}
        </div>
        <dl class="certification-details-v3__list" aria-labelledby="general-informations">
          <dt id="creation-date">
            {{t "pages.certifications.certification.details.v3.general-informations.labels.created-at"}}
            :
          </dt>
          <dd aria-labelledby="creation-date">{{dayjsFormat @details.createdAt "DD/MM/YYYY HH:mm:ss"}}</dd>
          {{#if this.completionDate}}
            <dt id="completion-date">
              {{t "pages.certifications.certification.details.v3.general-informations.labels.ended-at"}}
              :
            </dt>
            <dd aria-labelledby="completion-date">
              <PixTooltip @isWide={{true}}>
                <:triggerElement>
                  <span tabindex="0" class="certification-details-v3-list__completion-date">{{dayjsFormat
                      this.completionDate
                      "DD/MM/YYYY HH:mm:ss"
                    }}</span>
                </:triggerElement>
                <:tooltip>
                  {{#if this.completionDateTooltipContent}}
                    {{t this.completionDateTooltipContent}}
                  {{/if}}
                </:tooltip>
              </PixTooltip>
              {{#if (lt @details.duration this.twentyFourHoursInMs)}}
                <PixTag @color={{this.durationTagColor}}>{{DayjsFormatDuration @details.duration "HH[h]mm"}}</PixTag>
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

          <dt id="pix-score">
            {{t "pages.certifications.certification.details.v3.general-informations.labels.pix-score"}}
            :
          </dt>
          <dd aria-labelledby="pix-score">{{@details.pixScore}}</dd>
        </dl>
      </section>
      <section class="page-section">
        <h2 class="certification-details-v3__title" id="more-informations">
          {{t "pages.certifications.certification.details.v3.more-informations.title"}}
        </h2>

        <dl class="certification-details-v3__list" aria-labelledby="more-informations" role="list">
          <dt>
            {{t "pages.certifications.certification.details.v3.more-informations.labels.numberof-answered-questions"}}
            <br />
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
      <div class="content-text content-text--small">
        <div class="table-admin">
          <table>
            <thead>
              <tr>
                <th class="table__column--small">
                  {{t "pages.certifications.certification.details.v3.questions-list.labels.number"}}
                </th>
                <th class="certification-details-v3-table__answered-at-column">
                  {{t "pages.certifications.certification.details.v3.questions-list.labels.answered-at"}}
                </th>
                <th class="certification-details-v3-table__answer-status-column">
                  {{t "pages.certifications.certification.details.v3.questions-list.labels.answer-status"}}
                </th>
                <th class="certification-details-v3-table__competence-column">
                  {{t "pages.certifications.certification.details.v3.questions-list.labels.competence"}}
                </th>
                <th class="certification-details-v3-table__skill-column">
                  {{t "pages.certifications.certification.details.v3.questions-list.labels.skill"}}
                </th>
                <th class="certification-details-v3-table__challenge-id-column">
                  {{t "pages.certifications.certification.details.v3.questions-list.labels.challenge-id"}}
                </th>
                <th>{{t "pages.certifications.certification.details.v3.questions-list.labels.actions"}}</th>
              </tr>
            </thead>
            <tbody>
              {{#each @details.certificationChallengesForAdministration as |certificationChallenge|}}
                <tr>
                  <td>{{certificationChallenge.questionNumber}}</td>
                  <td>
                    {{#if certificationChallenge.answeredAt}}
                      <time>
                        {{dayjsFormat certificationChallenge.answeredAt "HH:mm:ss"}}
                      </time>
                    {{else}}
                      -
                    {{/if}}
                  </td>
                  <td>
                    {{#if (this.shouldDisplayAnswerStatus certificationChallenge)}}
                      <PixTag @color={{this.answerStatusColor certificationChallenge.answerStatus}}>
                        {{t (this.answerStatusLabel certificationChallenge.answerStatus)}}
                      </PixTag>
                    {{else}}
                      -
                    {{/if}}
                  </td>
                  <td>{{certificationChallenge.competenceIndex}} {{certificationChallenge.competenceName}}</td>
                  <td>{{certificationChallenge.skillName}}</td>
                  <td>
                    <a
                      href={{this.externalUrlForPixEditor certificationChallenge.id}}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={{t
                        "pages.certifications.certification.details.v3.questions-list.actions.informations.extra-information"
                      }}
                    >
                      {{certificationChallenge.id}}
                      <FaIcon @icon="external-link" />
                    </a>
                  </td>
                  <td class="certification-details-v3-table__challenge-action-cell">
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
                      <FaIcon @icon="eye" />
                    </a>

                    {{#if certificationChallenge.validatedLiveAlert}}
                      <button
                        title={{t
                          "pages.certifications.certification.details.v3.questions-list.actions.display-live-alert.label"
                        }}
                        aria-label={{t
                          "pages.certifications.certification.details.v3.questions-list.actions.display-live-alert.extra-information"
                        }}
                        type="button"
                        {{on "click" (fn this.openModal certificationChallenge)}}
                      >
                        <FaIcon @icon="warning" />
                      </button>
                    {{/if}}

                    {{#if (this.shouldDisplayAnswerValueIcon certificationChallenge)}}
                      <button
                        title={{t
                          "pages.certifications.certification.details.v3.questions-list.actions.display-answer.label"
                        }}
                        aria-label={{t
                          "pages.certifications.certification.details.v3.questions-list.actions.display-answer.extra-information"
                        }}
                        type="button"
                        {{on "click" (fn this.openModal certificationChallenge)}}
                      >
                        <FaIcon @icon="message" />
                      </button>
                    {{/if}}
                  </td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
      </div>
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
