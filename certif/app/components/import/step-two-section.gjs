import { PixAccordions, PixButton, PixIcon, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import gt from 'ember-truth-helpers/helpers/gt';
import FileImportBlock from 'pix-certif/components/import/file-import-block';

export default class StepTwoSectionComponent extends Component {
  @service intl;

  get translatedBlockingErrorReport() {
    const blockingErrorReports = this._blockingErrors;

    return blockingErrorReports.map(({ line, code }) => ({
      line,
      message: _translatedErrorCodeToMessage(this.intl, code),
    }));
  }

  get translatedNonBlockingErrorReport() {
    const nonBlockingErrors = this._nonBlockingErrors;

    return nonBlockingErrors.map(({ line, code }) => ({
      line,
      message: _translatedNonBlockingErrorCodeToMessage(this.intl, code),
    }));
  }

  get blockingErrorReportsCount() {
    const blockingErrorReports = this._blockingErrors;

    return blockingErrorReports?.length;
  }

  get nonBlockingErrorReportsCount() {
    const nonBlockingErrorReports = this._nonBlockingErrors;

    return nonBlockingErrorReports?.length;
  }

  get noError() {
    const blockingErrorReports = this._blockingErrors;
    const nonBlockingErrorReports = this._nonBlockingErrors;

    return !(nonBlockingErrorReports?.length || blockingErrorReports?.length);
  }

  get _blockingErrors() {
    return this.args.errorReports.filter((error) => error.isBlocking);
  }

  get _nonBlockingErrors() {
    return this.args.errorReports.filter((error) => !error.isBlocking);
  }

  get hasOnlyNonBlockingErrorReports() {
    return this.blockingErrorReportsCount === 0 && this.nonBlockingErrorReportsCount > 0;
  }

  <template>
    <section class='import-page__section--download panel'>
      {{#if @isLoading}}
        <div class='import-page-section__app-loader'>
          <img src='/images/interwind.gif' alt />
        </div>
      {{else}}
        <div class='import-page__title'>
          <PixIcon @name='assignment' @plainIcon={{true}} @ariaHidden={{true}} />
          <h2>{{t 'pages.sessions.import.step-two.title'}}</h2>
        </div>

        <ul class='import-page-section__result-count-list'>
          <li class='import-page-section__result-count-item'>
            <PixIcon @name='session' @plainIcon={{true}} @ariaHidden={{true}} />
            <p>
              {{t
                'pages.sessions.import.step-two.sessions-and-empty-sessions-count'
                sessionsCount=@sessionsCount
                sessionsWithoutCandidatesCount=@sessionsWithoutCandidatesCount
              }}
            </p>
          </li>
          <li class='import-page-section__result-count-item'>
            <PixIcon @name='infoUser' @plainIcon={{true}} @ariaHidden={{true}} />
            <p>
              {{t 'pages.sessions.import.step-two.candidates-count' candidatesCount=@candidatesCount}}
            </p>
          </li>
        </ul>

        {{#if (gt this.blockingErrorReportsCount 0)}}
          <span class='import-page-section__information'>
            {{t 'pages.sessions.import.step-two.blocking-errors.information'}}
          </span>
          <div>
            <PixAccordions
              @iconName='error'
              @plainIcon={{true}}
              @tagContent={{t
                'pages.sessions.import.step-two.blocking-errors.tag-information'
                blockingErrorReportsCount=this.blockingErrorReportsCount
              }}
              @tagColor='error'
              class='accordions-header accordions-header--blocking'
            >
              <:title>
                {{t
                  'pages.sessions.import.step-two.blocking-errors.title'
                  blockingErrorReportsCount=this.blockingErrorReportsCount
                }}
              </:title>
              <:content>
                <ul class='accordions-header__list'>
                  {{#each this.translatedBlockingErrorReport as |report|}}
                    <li>
                      <PixNotificationAlert @type='error'>
                        {{t 'pages.sessions.import.step-two.blocking-errors.line'}}
                        {{report.line}}
                        :
                        {{report.message}}
                      </PixNotificationAlert>
                    </li>
                  {{/each}}
                </ul>
              </:content>
            </PixAccordions>
          </div>
        {{/if}}
        {{#if (gt this.nonBlockingErrorReportsCount 0)}}
          <span class='import-page-section__information'>
            {{t
              'pages.sessions.import.step-two.non-blocking-errors.information'
              nonBlockingErrorReportsCount=this.nonBlockingErrorReportsCount
            }}
          </span>
          <div>
            <PixAccordions
              @iconName='warning'
              @plainIcon={{true}}
              @tagContent={{t
                'pages.sessions.import.step-two.non-blocking-errors.tag-information'
                nonBlockingErrorReportsCount=this.nonBlockingErrorReportsCount
              }}
              @tagColor='secondary'
              class='accordions-header accordions-header--non-blocking'
            >
              <:title>
                {{t
                  'pages.sessions.import.step-two.non-blocking-errors.title'
                  nonBlockingErrorReportsCount=this.nonBlockingErrorReportsCount
                }}
              </:title>
              <:content>
                <ul class='accordions-header__list'>
                  {{#each this.translatedNonBlockingErrorReport as |report|}}
                    <li>
                      <PixNotificationAlert @type='warning'>
                        {{t 'pages.sessions.import.step-two.non-blocking-errors.line'}}
                        {{report.line}}
                        :
                        {{report.message}}
                      </PixNotificationAlert>
                    </li>
                  {{/each}}
                </ul>
              </:content>
            </PixAccordions>
          </div>
        {{/if}}

        <div>
          {{#if this.hasOnlyNonBlockingErrorReports}}
            <PixButton class='import-page__section--confirm-button--non-blocking' @triggerAction={{@createSessions}}>
              {{t 'pages.sessions.import.step-two.actions.confirm-with-warning.label'}}
            </PixButton>
          {{/if}}
          {{#if this.noError}}
            <PixButton class='import-page__section--confirm-button' @triggerAction={{@createSessions}}>
              {{t 'pages.sessions.import.step-two.actions.confirm.label'}}
            </PixButton>
          {{/if}}
        </div>
      {{/if}}
    </section>

    {{#unless this.noError}}
      <section class='import-page__section--download panel'>
        <div class='import-page__title'>
          <PixIcon @name='upload' @ariaHidden={{true}} />

          <h2>{{t 'pages.sessions.import.step-two.actions.import-again.title'}}</h2>
        </div>
        <FileImportBlock
          @file={{@file}}
          @filename={{@filename}}
          @removeImport={{@removeImport}}
          @preImportSessions={{@preImportSessions}}
          @buttonLabel={{t 'pages.sessions.import.step-two.actions.import-again.label'}}
        />

        {{#if @importErrorMessage}}
          <PixNotificationAlert @type='error' @withIcon={{true}}>{{@importErrorMessage}}</PixNotificationAlert>
        {{/if}}

        <div>
          <PixButton
            @variant='secondary'
            @isBorderVisible={{true}}
            @triggerAction={{fn @validateSessions false}}
            @isDisabled={{@isImportDisabled}}
          >
            {{t 'common.actions.continue'}}
          </PixButton>
        </div>
      </section>
    {{/unless}}
  </template>
}

function _translatedErrorCodeToMessage(intl, code) {
  return intl.t(`pages.sessions.import.step-two.blocking-errors.errors.${code}`);
}

function _translatedNonBlockingErrorCodeToMessage(intl, code) {
  return intl.t(`pages.sessions.import.step-two.non-blocking-errors.errors.${code}`);
}
