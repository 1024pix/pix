import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class UpdateExpiredPasswordRoute extends Route {
  @service session;

  queryParams = {
    passwordResetToken: {
      refreshModel: true,
    },
  };

  beforeModel() {
    this.session.prohibitAuthentication('authenticated.user-dashboard');
  }

  model(params) {
    return {
      passwordResetToken: params.passwordResetToken,
    };
  }
}
