import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class InaccessibleCampaign extends Component {
  @service currentDomain;

  get shouldShowTheMarianneLogo() {
    return this.currentDomain.isFranceDomain;
  }
}
