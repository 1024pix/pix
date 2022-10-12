import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SessionCleaResultsDownload extends Component {
  @service fileSaver;
  @service session;
  @tracked cleaCandidateDataDownloadErrorMessage = null;

  @action
  async downloadCleaCertifiedCandidateData() {
    this.cleaCandidateDataDownloadErrorMessage = null;
    const url = `/api/sessions/${this.args.session.id}/certified-clea-candidate-data`;
    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, token });
    } catch (error) {
      this.cleaCandidateDataDownloadErrorMessage = error.message;
    }
  }
}
