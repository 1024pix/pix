import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';

export default class SessionParametersController extends Controller {

  @alias('model') session;
  @tracked tooltipText = 'Copier le lien direct';

  @action
  clipboardSuccess() {
    this.tooltipText = 'Copié !';
  }

  @action
  clipboardOut() {
    this.tooltipText = 'Copier le code d\'accès';
  }
}
