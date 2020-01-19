import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import config from '../../../../config/environment';

export default class AuthenticatedSessionsDetailsParametersController extends Controller {

  @alias('model') session;
  @tracked tooltipText;

  constructor() {
    super(...arguments);

    this.isSessionFinalizationActive = config.APP.isSessionFinalizationActive;
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
