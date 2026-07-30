import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class ImportCandidates extends Component {
  @service session;
  @service pixToast;
  @service store;
  @service intl;

  @action
  async importCertificationCandidates(files) {
    const adapter = this.store.adapterFor('certification-candidates-import');
    const sessionId = this.args.session.id;

    this.isLoading = true;
    try {
      await adapter.addCertificationCandidatesFromOds(sessionId, files);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.sessions.import.candidates-list.import-success'),
      });
      await this.args.reloadCertificationCandidate();
    } catch (errorResponse) {
      const errorMessage = this._handleErrorMessage(errorResponse);

      this.pixToast.sendErrorNotification({ message: htmlSafe(errorMessage) });
    } finally {
      this.isLoading = false;
    }
  }

  _handleErrorMessage(errorResponse) {
    const error = errorResponse?.errors?.[0];
    const errorPrefix = this.intl.t('pages.sessions.import.candidates-list.import-fail-prefix', { htmlSafe: true });

    if (error?.code) {
      if (error.meta?.line) {
        return `${errorPrefix} ${this.intl.t(`common.labels.line`, { line: error.meta.line })}
        ${this.intl.t(`common.api-error-messages.certification-candidate.${error.code}`, {
          ...error.meta,
        })}`;
      }

      return `${errorPrefix} ${this.intl.t(`common.api-error-messages.${error.code}`)}`;
    }
    return `${errorPrefix} ${this.intl.t('pages.sessions.import.candidates-list.try-again-or-contact')}`;
  }

  <template>
    <div class='panel panel-actions'>
      <div class='content-text'>
        <div class='panel-actions__header'>
          <PixIcon @name='info' @plainIcon={{true}} @ariaHidden={{true}} class='panel-actions__header-icon' />
          <h3 class='panel-actions__header-title'>{{t 'pages.sessions.detail.candidates.panel-actions.title'}}</h3>
        </div>
        <div class='panel-actions__action-row'>
          <PixIcon @name='download' @ariaHidden={{true}} class='panel-actions__action-icon' />
          <div class='panel-actions__description'>
            <h4 class='panel-actions__title'>{{t
                'pages.sessions.detail.candidates.panel-actions.actions.download.extra-information'
              }}</h4>
            <p class='panel-actions-description__information'>{{t
                'pages.sessions.detail.candidates.panel-actions.actions.download.description'
                htmlSafe=true
              }}
            </p>
          </div>
          <div class='panel-actions__button'>
            <PixButton @triggerAction={{@fetchCandidatesImportTemplateAction}} target='_blank'>
              {{t 'pages.sessions.detail.candidates.panel-actions.actions.download.label'}}
            </PixButton>
          </div>
        </div>
        <div class='panel-actions__action-row'>
          {{#if @importAllowed}}
            <div class='panel-actions__action-icon'>
              <PixIcon @name='upload' @ariaHidden={{true}} class='panel-actions__action-icon' />
            </div>
            <div class='panel-actions__description'>
              <h4 class='panel-actions__title'>{{t
                  'pages.sessions.detail.candidates.panel-actions.actions.upload.extra-information'
                }}</h4>
              <p class='panel-actions-description__information'>
                {{t 'pages.sessions.detail.candidates.panel-actions.actions.upload.description' htmlSafe=true}}
              </p>
            </div>
            <div class='panel-actions__button'>
              <PixButtonUpload
                @id='upload-attendance-sheet'
                @onChange={{this.importCertificationCandidates}}
                accept='.ods'
              >
                {{t 'pages.sessions.detail.candidates.panel-actions.actions.upload.label'}}
              </PixButtonUpload>
            </div>
          {{else if @sessionExpired}}
            <PixIcon @name='error' @plainIcon={{true}} @ariaHidden={{true}} class='panel-actions__warning-icon' />
            <div class='panel-actions__description'>
              <strong class='panel-actions__warning'>
                {{t 'pages.sessions.detail.candidates.panel-actions.expired-warning' htmlSafe=true}}
              </strong>
            </div>
            {{else}}
              <PixIcon @name='error' @plainIcon={{true}} @ariaHidden={{true}} class='panel-actions__warning-icon' />
              <div class='panel-actions__description'>
                <strong class='panel-actions__warning'>
                  {{t 'pages.sessions.detail.candidates.panel-actions.started-warning' htmlSafe=true}}
                </strong>
              </div>
          {{/if}}
        </div>
      </div>
    </div>
  </template>
}
