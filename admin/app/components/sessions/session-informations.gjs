import { PixButton, PixTooltip } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import { not } from 'ember-truth-helpers';
import { DescriptionList } from 'pix-admin/components/ui/description-list';

import ConfirmPopup from '../confirm-popup';
import JuryComment from './jury-comment';

<template>
  <section class="page-section">
    <div class="session-info">

      <div class="session-info__certification-officer-assigned">
        <span>{{@sessionModel.assignedCertificationOfficer.fullName}}</span>
      </div>

      <DescriptionList data-testid="pw-session-info-description-list">

        <DescriptionList.Item @label={{t "pages.sessions.informations.labels.certification-center"}}>
          <LinkTo @route="authenticated.certification-centers.get" @model={{@sessionModel.certificationCenterId}}>
            {{@sessionModel.certificationCenterName}}
          </LinkTo>
        </DescriptionList.Item>

        <DescriptionList.Item @label={{t "pages.sessions.informations.labels.site-name"}}>
          {{@sessionModel.address}}
        </DescriptionList.Item>

        <DescriptionList.Item @label={{t "pages.sessions.informations.labels.room-name"}}>
          {{@sessionModel.room}}
        </DescriptionList.Item>

        <DescriptionList.Item @label={{t "pages.sessions.informations.labels.session-date-time"}}>
          {{formatDate @sessionModel.date}}
          à
          {{@sessionModel.time}}
        </DescriptionList.Item>

        <DescriptionList.Item @label={{t "pages.sessions.informations.labels.examiner"}}>
          {{@sessionModel.examiner}}
        </DescriptionList.Item>

        <DescriptionList.Item @label={{t "pages.sessions.informations.labels.description"}}>
          {{@sessionModel.description}}
        </DescriptionList.Item>

        <DescriptionList.Item @label={{t "pages.sessions.informations.labels.access-code"}}>
          {{@sessionModel.accessCode}}
        </DescriptionList.Item>

        <DescriptionList.Item @label={{t "pages.sessions.informations.labels.status"}}>
          {{@sessionModel.displayStatus}}
        </DescriptionList.Item>

        <DescriptionList.Item @label={{t "pages.sessions.informations.labels.creation-date"}}>
          {{formatDate @sessionModel.createdAt}}
        </DescriptionList.Item>

        {{#if @sessionModel.finalizedAt}}
          <DescriptionList.Item @label={{t "pages.sessions.informations.labels.finalization-date"}}>
            {{formatDate @sessionModel.finalizedAt}}
          </DescriptionList.Item>
        {{/if}}

        {{#if @sessionModel.publishedAt}}
          <DescriptionList.Item @label={{t "pages.sessions.informations.labels.publication-date"}}>
            {{formatDate @sessionModel.publishedAt}}
          </DescriptionList.Item>
        {{/if}}

        {{#if @sessionModel.resultsSentToPrescriberAt}}
          <DescriptionList.Item @label={{t "pages.sessions.informations.labels.results-sent-date"}}>
            {{formatDate @sessionModel.resultsSentToPrescriberAt}}
          </DescriptionList.Item>
        {{/if}}

        <DescriptionList.Item @label={{t "pages.sessions.informations.labels.started-certifications"}}>
          {{@sessionModel.numberOfStartedCertifications}}
        </DescriptionList.Item>

        {{#if @sessionModel.finalizedAt}}
          <DescriptionList.Item @label={{t "pages.sessions.informations.labels.impactful-issues"}}>
            {{@sessionModel.numberOfImpactfullIssueReports}}
          </DescriptionList.Item>

          <DescriptionList.Item @label={{t "pages.sessions.informations.labels.total-issues"}}>
            {{@sessionModel.totalNumberOfIssueReports}}
          </DescriptionList.Item>

          <DescriptionList.Item @label={{t "pages.sessions.informations.labels.scoring-errors"}}>
            {{@sessionModel.numberOfScoringErrors}}
          </DescriptionList.Item>

          {{#if @sessionModel.hasComplementaryInfo}}
            <DescriptionList.Item @label={{t "pages.sessions.informations.labels.complementary-info"}}>
              {{#if @sessionModel.hasIncident}}
                {{t "pages.sessions.informations.messages.incident-info"}}
              {{/if}}
              {{#if @sessionModel.hasJoiningIssue}}
                {{t "pages.sessions.informations.messages.joining-issue-info"}}
              {{/if}}
            </DescriptionList.Item>
          {{/if}}

          {{#if @sessionModel.hasExaminerGlobalComment}}
            <DescriptionList.Item @label={{t "pages.sessions.informations.labels.global-comment"}}>
              {{@sessionModel.examinerGlobalComment}}
            </DescriptionList.Item>
          {{/if}}
        {{/if}}

      </DescriptionList>

      {{#if @accessControl.hasAccessToCertificationActionsScope}}
        <div class="session-info__actions">
          {{#if @sessionModel.finalizedAt}}
            <PixButton @isDisabled={{@isCurrentUserAssignedToSession}} @triggerAction={{@checkForAssignment}}>
              {{#if @isCurrentUserAssignedToSession}}
                {{t "pages.sessions.informations.buttons.assigned-to-session"}}
              {{else}}
                {{t "pages.sessions.informations.buttons.assign-session"}}
              {{/if}}
            </PixButton>
            {{#if @sessionModel.isPublished}}
              <PixTooltip @position="right" @isWide={{true}}>
                <:triggerElement>
                  <PixButton
                    @isDisabled={{true}}
                    @triggerAction={{@onUnfinalizeSessionButtonClick}}
                    @variant="error"
                  >{{t "pages.sessions.informations.buttons.unfinalize-session"}}
                  </PixButton>
                </:triggerElement>

                <:tooltip>{{t "pages.sessions.informations.tooltips.cannot-unfinalize-published"}}
                </:tooltip>
              </PixTooltip>
            {{else}}
              <PixButton @triggerAction={{@onUnfinalizeSessionButtonClick}} @variant="error">{{t
                  "pages.sessions.informations.buttons.unfinalize-session"
                }}
              </PixButton>
            {{/if}}
          {{/if}}

          <div class="session-info__copy-button">
            {{#if @isCopyButtonClicked}}
              <p>{{@copyButtonText}}</p>
            {{/if}}

            <PixButton
              @size="small"
              @triggerAction={{@copyResultsDownloadLink}}
              @variant="secondary"
              @iconBefore="copy"
              @plainIconBefore={{true}}
            >
              {{t "pages.sessions.informations.buttons.copy-results-link"}}
            </PixButton>
          </div>

          <div class="session-info__published-buttons">
            <PixButton
              @triggerAction={{@downloadPDFAttestations}}
              @variant="secondary"
              class="session-info__download-button"
              @isDisabled={{not @sessionModel.isPublished}}
              @iconBefore="download"
            >
              {{t "pages.sessions.informations.actions.download-certificates"}}
            </PixButton>
          </div>
        </div>
      {{/if}}
    </div>
  </section>

  <JuryComment
    @author={{@sessionModel.juryCommentAuthor.fullName}}
    @date={{@sessionModel.juryCommentedAt}}
    @comment={{@sessionModel.juryComment}}
    @onFormSubmit={{@saveComment}}
    @onDeleteButtonClicked={{@deleteComment}}
  />

  <ConfirmPopup
    @title={{@modalTitle}}
    @message={{@modalMessage}}
    @confirm={{@modalConfirmAction}}
    @cancel={{@cancelModal}}
    @show={{@isShowingModal}}
  />
</template>
