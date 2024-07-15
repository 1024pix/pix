import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class NavbarHeader extends Component {
  @service currentDomain;

  get isFrenchDomainExtension() {
    return this.currentDomain.isFranceDomain;
  }

  @action
  async triggerAction(event) {
    console.log(event.detail);
  }
}
