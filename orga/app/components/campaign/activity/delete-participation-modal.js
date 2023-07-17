import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class deleteParticipationModal extends Component {
  @service intl;

  get deleteParticipationModalWarning() {
    if (!this.args.participation) {
      return null;
    }
    return this.intl.t(
      `${DELETE_PARTICIPATION_MODAL_WARNING[this.args.campaign.type][this.args.participation.status]}`,
    );
  }
}

const DELETE_PARTICIPATION_MODAL_WARNING = {
  ASSESSMENT: {
    STARTED:
      'pages.campaign-activity.delete-participation-modal.warning.assessment-campaign-participation.started-participation',
    TO_SHARE:
      'pages.campaign-activity.delete-participation-modal.warning.assessment-campaign-participation.to-share-participation',
    SHARED:
      'pages.campaign-activity.delete-participation-modal.warning.assessment-campaign-participation.shared-participation',
  },
  PROFILES_COLLECTION: {
    TO_SHARE:
      'pages.campaign-activity.delete-participation-modal.warning.profiles-collection-campaign-participation.to-share-participation',
    SHARED:
      'pages.campaign-activity.delete-participation-modal.warning.profiles-collection-campaign-participation.shared-participation',
  },
};
