import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import config from '../../../../config/environment';

export default class SessionParametersController extends Controller {

  @alias('model') session;
  @tracked tooltipText = 'Copier le lien direct';
  isSessionFinalizationActive = config.APP.isSessionFinalizationActive;

  @action
  clipboardSuccess() {
    this.tooltipText = 'Copié !';
  }

  @action
  clipboardOut() {
    this.tooltipText = 'Copier le code d\'accès';
  }
}
