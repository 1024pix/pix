import Component from '@glimmer/component';
import { action } from '@ember/object';
import config from 'pix-certif/config/environment';

export default class CertificationCandidateInStagingItem extends Component {

  isResultRecipientEmailVisible = config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE;

  @action
  updateCandidateDataBirthdate(value) {
    this.args.updateCandidateBirthdate(this.args.candidateData, value);
  }

  @action
  cancel() {
    this.args.onClickCancel(this.args.candidateData);
  }
}
