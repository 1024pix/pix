import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class InaccessibleCampaign extends Component {
  @service url;

  get shouldShowTheMarianneLogo() {
    return this.url.isFrenchDomainExtension;
  }
}
