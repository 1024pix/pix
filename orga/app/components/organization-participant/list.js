import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class OrganizationParticipantList extends Component {
  get footerId() {
    return guidFor(this);
  }

  get footerBanner() {
    return document.getElementById(this.footerId);
  }
}
