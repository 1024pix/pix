import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class RoutesAuthenticatedSessionsDetailsParametersTab extends Component {

  constructor() {
    super(...arguments);

    this.tooltipText = 'Copier le lien direct';
  }

  @action
  clipboardSuccess() {
    this.tooltipText = 'Copié !';
  }

    @action
  clipboardOut() {
    this.tooltipText = 'Copier le code d\'accès';
  }
}
