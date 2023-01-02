import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class CampaignType extends Component {
  @service intl;

  get picto() {
    const { campaignType } = this.args;
    return campaignType === 'ASSESSMENT' ? 'assessment.svg' : 'profiles-collection.svg';
  }

  get label() {
    const { campaignType } = this.args;
    return this.intl.t(`pages.organization-learner.activity.participation-list.type.${campaignType}`);
  }
}
