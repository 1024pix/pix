import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class SessionDetailsCleaResultsDownload extends Component {
  @service intl;
  @service fileSaver;
  @service session;
  @service pixToast;

  @action
  async downloadCleaCertifiedCandidateData() {
    const url = `/api/sessions/${this.args.sessionId}/certified-clea-candidate-data`;
    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, token });
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('pages.sessions.detail.panel-clea.error-message') });
    }
  }

  <template>
    <div class='panel session-details__clea-results-download'>
      <div class='session-details__clea-results-download-grey'>
        <PixIcon
          @name='awards'
          @plainIcon={{true}}
          class='session-details__clea-results-download-icon'
          @ariaHidden={{true}}
        />
        <div>
          <h1 class='session-details__clea-results-download-title'>
            {{t 'pages.sessions.detail.panel-clea.title'}}
          </h1>
          <p class='session-details__clea-results-download-description'>
            {{t 'pages.sessions.detail.panel-clea.description'}}
            <a class='link' href='https://cleanumerique.org/' target='_blank' rel='noopener noreferrer'>
              {{t 'pages.sessions.detail.panel-clea.link-text'}}
              <PixIcon @name='link' @ariaHidden={{true}} class='session-details__clea-results-link-icon' />
            </a>
          </p>

          <PixButton @triggerAction={{this.downloadCleaCertifiedCandidateData}}>
            {{t 'pages.sessions.detail.panel-clea.download-button'}}
          </PixButton>
        </div>
      </div>
    </div>
  </template>
}
