import { computed } from '@ember/object';
import Component from '@ember/component';

export default class CampaignItem extends Component {

  @computed('campaign.campaignReport.participationsCount')
  get participationsCount() {
    const participationsCount = this.get('campaign.campaignReport.participationsCount');

    return participationsCount > 0 ? participationsCount : '-';
  }

  @computed('campaign.campaignReport.sharedParticipationsCount')
  get sharedParticipationsCount() {
    const sharedParticipationsCount = this.get('campaign.campaignReport.sharedParticipationsCount');

    return sharedParticipationsCount > 0 ? sharedParticipationsCount : '-';
  }
}
