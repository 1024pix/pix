import { PixButtonLink, PixIconButton, PixTooltip } from '@1024pix/nebulix-ember';
import isClipboardSupported from 'ember-cli-clipboard/helpers/is-clipboard-supported';
import t from 'ember-intl/helpers/t';

<template>
  <div class='panel session-details-container'>
    <div class='session-details-row'>
      <div class='session-details-content session-details-content--multiple session-details-content--copyable'>
        <h3 class='label-text session-details-content__label'>{{t
            'pages.sessions.detail.parameters.session.label'
          }}</h3>
        <div class='session-details-content__clipboard'>
          <span class='content-text content-text--bold session-details-content__text'>{{@controller.session.id}}</span>
          {{#if (isClipboardSupported)}}
            <PixTooltip
              @id='tooltip-clipboard-button'
              class='session-details-content__clipboard-button'
              @isInline={{true}}
              @hide={{@controller.isSessionNumberTooltipTextEmpty}}
            >
              <:triggerElement>
                <PixIconButton
                  @ariaLabel={{t 'pages.sessions.detail.parameters.session.copy-number'}}
                  @iconName='copy'
                  @plainIcon={{true}}
                  @triggerAction={{@controller.showSessionIdTooltip}}
                  class='session-details-content__clipboard-button'
                />
              </:triggerElement>
              <:tooltip>{{@controller.sessionNumberTooltipText}}</:tooltip>
            </PixTooltip>
          {{/if}}
        </div>
      </div>

      <div class='session-details-content session-details-content--multiple session-details-content--copyable'>
        <h3 class='label-text session-details-content__label'>
          {{t 'pages.sessions.detail.parameters.access-code.label'}}
          <div class='session-details-content__sub-label'>
            {{t 'pages.sessions.detail.parameters.access-code.candidate'}}
          </div>
        </h3>
        <div class='session-details-content__clipboard'>
          <span
            class='content-text content-text--bold session-details-content__text'
          >{{@controller.session.accessCode}}</span>
          {{#if (isClipboardSupported)}}
            {{! template-lint-disable no-duplicate-id }}
            <PixTooltip
              @id='tooltip-clipboard-button'
              class='session-details-content__clipboard-button'
              @isInline={{true}}
              @hide={{@controller.isAccessCodeTooltipTextEmpty}}
            >
              <:triggerElement>
                <PixIconButton
                  @ariaLabel={{t 'pages.sessions.detail.parameters.access-code.copy-code'}}
                  @iconName='copy'
                  @plainIcon={{true}}
                  @triggerAction={{@controller.showAccessCodeTooltip}}
                />
              </:triggerElement>
              <:tooltip>{{@controller.accessCodeTooltipText}}</:tooltip>
            </PixTooltip>
          {{/if}}
        </div>
      </div>

      <div class='session-details-content session-details-content--multiple session-details-content--copyable'>
        <h3 class='label-text session-details-content__label'>
          {{t 'pages.sessions.detail.parameters.password.label'}}
          <div class='session-details-content__sub-label'>
            {{t 'common.sessions.invigilator'}}
          </div>
        </h3>
        <div class='session-details-content__clipboard'>
          <span class='content-text content-text--bold session-details-content__text'>
            C-{{@controller.session.invigilatorPassword}}
          </span>
          {{! template-lint-disable no-duplicate-id }}
          {{#if (isClipboardSupported)}}
            <PixTooltip
              @id='tooltip-clipboard-button'
              @isInline={{true}}
              @hide={{@controller.isInvigilatorPasswordTooltipTextEmpty}}
              class='session-details-content__clipboard-button'
            >
              <:triggerElement>
                <PixIconButton
                  @ariaLabel={{t 'pages.sessions.detail.parameters.password.copy-password'}}
                  @iconName='copy'
                  @plainIcon={{true}}
                  @triggerAction={{@controller.showInvigilatorPasswordTooltip}}
                />
              </:triggerElement>
              <:tooltip>{{@controller.invigilatorPasswordTooltipText}}</:tooltip>
            </PixTooltip>
          {{/if}}
        </div>
      </div>

      <div class='session-details-content session-details-content--multiple'>
        <h3 class='label-text session-details-content__label'>
          {{t 'common.forms.session-labels.center-name'}}
        </h3>
        <span class='content-text session-details-content__text'>{{@controller.session.address}}</span>
      </div>

      <div class='session-details-content session-details-content--multiple'>
        <h3 class='label-text session-details-content__label'>{{t 'common.forms.session-labels.room'}}</h3>
        <span class='content-text session-details-content__text'>{{@controller.session.room}}</span>
      </div>

      <div class='session-details-content session-details-content--multiple'>
        <h3 class='label-text session-details-content__label'>
          {{t 'common.forms.session-labels.invigilator'}}
        </h3>
        <span class='content-text session-details-content__text'>{{@controller.session.examiner}}</span>
      </div>

    </div>

    <div class='session-details-row'>
      <div class='session-details-content session-details-content--single'>
        <h3 class='label-text session-details-content__label'>{{t 'common.forms.session-labels.observations'}}</h3>
        <p class='content-text session-details-content__text'>
          {{@controller.session.description}}
        </p>
      </div>
    </div>

    <div class='session-details-buttons'>
      {{#if @controller.sessionHasStartedCertification}}
        {{#if @controller.sessionManagement.isFinalized}}
          <p class='session-details-row__session-finalized-warning'>
            {{t 'pages.sessions.detail.parameters.finalization-info'}}
          </p>
        {{else}}
          <PixButtonLink @route='authenticated.sessions.finalize' @model={{@controller.session.id}} class='push-right'>
            {{t 'pages.sessions.detail.parameters.actions.finalizing'}}
          </PixButtonLink>
        {{/if}}
      {{else}}
        <PixButtonLink
          @route='authenticated.sessions.update'
          @model={{@controller.session.id}}
          aria-label={{t 'pages.sessions.detail.parameters.actions.update' sessionId=@controller.session.id}}
        >
          {{t 'common.actions.update'}}
        </PixButtonLink>
      {{/if}}
    </div>
  </div>
</template>
