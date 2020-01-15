import Controller from '@ember/controller';
import config from '../../../../config/environment';

export default class AuthenticatedSessionsDetailsParametersController extends Controller {

  constructor() {
    super(...arguments);

    this.isSessionFinalizationActive = config.APP.isSessionFinalizationActive;
  }
}
