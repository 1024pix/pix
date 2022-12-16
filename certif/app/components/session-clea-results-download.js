import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SessionCleaResultsDownload extends Component {
  @service intl;
  @service fileSaver;
  @service session;
  @service notifications;

  @action
  async downloadCleaCertifiedCandidateData() {
    const url = `/api/sessions/${this.args.session.id}/certified-clea-candidate-data`;
    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, token });
    } catch {
      this.notifications.error(this.intl.t('pages.sessions.detail.panel-clea.error-message'));
    }
  }
}
