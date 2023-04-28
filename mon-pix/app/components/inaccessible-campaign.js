import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class InaccessibleCampaign extends Component {
  @service currentDomain;

  get shouldShowTheMarianneLogo() {
    return this.currentDomain.isFranceDomain;
  }
}
