import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class InaccessibleCampaign extends Component {
  @service currentDomain;

  get shouldShowTheMarianneLogo() {
    return this.currentDomain.isFranceDomain;
  }
}
