import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class NavbarHeader extends Component {
  @service currentDomain;
  @tracked fragment;

  constructor() {
    super(...arguments);
    fetch('https://epreuves-pr1787.review.pix.fr/fr/qcu_image/1d_MiseEnForme_mots.fragment.html')
      .then((response) => {
        return response.text();
      })
      .then((html) => {
        this.fragment = html;
      });
  }

  get isFrenchDomainExtension() {
    return this.currentDomain.isFranceDomain;
  }

  @action
  async handleAnswer(event) {
    console.log(event.detail);
  }
}
