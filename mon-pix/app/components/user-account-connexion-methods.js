import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class UserAccountConnexionMethodsComponent extends Component {

  @service featureToggles;

  get shouldShowEmail() {
    return !!this.args.user.email;
  }

  get shouldShowUsername() {
    return !!this.args.user.username;
  }

  get isEmailValidationEnabled() {
    return this.featureToggles.featureToggles.isEmailValidationEnabled;
  }
}
