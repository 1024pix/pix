import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class deleteParticipationModal extends Component {
  @service intl;

  get deleteParticipationModalText() {
    if (!this.args.participation) {
      return null;
    }
    return this.intl.t(
      `${DELETE_PARTICIPATION_MODAL_CONTENT[this.args.campaign.type][this.args.participation.status]}`
    );
  }
}

const DELETE_PARTICIPATION_MODAL_CONTENT = {
  ASSESSMENT: {
    STARTED:
      'pages.campaign-activity.delete-participation-modal.text.assessment-campaign-participation.started-participation',
    TO_SHARE:
      'pages.campaign-activity.delete-participation-modal.text.assessment-campaign-participation.to-share-participation',
    SHARED:
      'pages.campaign-activity.delete-participation-modal.text.assessment-campaign-participation.shared-participation',
  },
  PROFILES_COLLECTION: {
    TO_SHARE:
      'pages.campaign-activity.delete-participation-modal.text.profiles-collection-campaign-participation.to-share-participation',
    SHARED:
      'pages.campaign-activity.delete-participation-modal.text.profiles-collection-campaign-participation.shared-participation',
  },
};
