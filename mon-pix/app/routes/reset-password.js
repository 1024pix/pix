import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

const _ = require('lodash');

@classic
export default class ResetPasswordRoute extends Route {
  @service session;
  @service errors;

  async model(params) {
    const passwordResetTemporaryKey = params.temporary_key;
    try {
      const user = await this.store.queryRecord('user', { passwordResetTemporaryKey });
      return { user, temporaryKey: passwordResetTemporaryKey };
    } catch (error) {
      const status = _.get(error, 'errors[0].status');
      if (status && (status === 401 || status && 404)) {
        this.errors.push('Nous sommes désolés, mais votre demande de réinitialisation de mot de passe a déjà été utilisée ou est expirée. Merci de recommencer.');
        this.replaceWith('password-reset-demand');
      }
    }
  }
}
