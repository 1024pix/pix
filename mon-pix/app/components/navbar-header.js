import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class NavbarHeader extends Component {
  @service currentDomain;

  get isFrenchDomainExtension() {
    return this.currentDomain.isFranceDomain;
  }
}
