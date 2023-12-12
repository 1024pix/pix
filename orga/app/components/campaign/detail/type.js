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

  get pictoAriaHidden() {
    return !this.args.hideLabel;
  }

  get pictoTitle() {
    return this.args.hideLabel ? this.label : null;
  }

  get label() {
    const { campaignType, labels } = this.args;

    return this.intl.t(labels[campaignType]);
  }
}
