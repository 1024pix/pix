import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';

export default class Footer extends Component {
  @service url;

  @tracked date;

  get shouldShowTheMarianneLogo() {
    return this.url.isFrenchDomainExtension;
  }

  get currentYear() {
    this.date = new Date();
    return this.date.getFullYear().toString();
  }
}
