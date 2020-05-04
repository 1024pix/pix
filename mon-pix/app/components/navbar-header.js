import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

const FRENCH_DOMAIN_EXTENSION = 'fr';

export default class NavbarHeader extends Component {
  @service currentDomain;

  get isFrenchDomainExtension() {
    return FRENCH_DOMAIN_EXTENSION == this.currentDomain.getExtension();
  }
}
