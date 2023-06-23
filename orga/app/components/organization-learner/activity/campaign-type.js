import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class CampaignType extends Component {
  @service intl;

  get picto() {
    const { campaignType } = this.args;
    return campaignType === 'ASSESSMENT' ? 'tachometer' : 'person-export';
  }

  get pictoCssClass() {
    const { campaignType } = this.args;
    return campaignType === 'ASSESSMENT' ? 'campaign-type__icon-assessment' : 'campaign-type__icon-profile-collection';
  }

  get label() {
    const { campaignType } = this.args;
    return this.intl.t(`pages.organization-learner.activity.participation-list.type.${campaignType}`);
  }
}
