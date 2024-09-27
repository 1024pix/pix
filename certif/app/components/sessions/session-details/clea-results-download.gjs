import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class SessionDetailsCleaResultsDownload extends Component {
  @service intl;
  @service fileSaver;
  @service session;
  @service notifications;

  @action
  async downloadCleaCertifiedCandidateData() {
    const url = `/api/sessions/${this.args.sessionId}/certified-clea-candidate-data`;
    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, token });
    } catch {
      this.notifications.error(this.intl.t('pages.sessions.detail.panel-clea.error-message'));
    }
  }

  <template>
    <div class='panel session-details__clea-results-download'>
      <div class='session-details__clea-results-download-grey'>
        <div class='session-details__clea-results-download-icon'>
          <FaIcon @icon='award' />
        </div>
        <div>
          <h1 class='session-details__clea-results-download-title'>
            {{t 'pages.sessions.detail.panel-clea.title'}}
          </h1>
          <p class='session-details__clea-results-download-description'>
            {{t 'pages.sessions.detail.panel-clea.description'}}
            <a class='link' href='https://cleanumerique.org/' target='_blank' rel='noopener noreferrer'>
              {{t 'pages.sessions.detail.panel-clea.link-text'}}
              <FaIcon @icon='link' /></a>
          </p>

          <PixButton @triggerAction={{this.downloadCleaCertifiedCandidateData}}>
            {{t 'pages.sessions.detail.panel-clea.download-button'}}
          </PixButton>
        </div>
      </div>
    </div>
  </template>
}
