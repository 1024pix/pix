import Component from '@glimmer/component';

export default class UserAccountConnexionMethodsComponent extends Component {

  get shouldShowEmail() {
    return !!this.args.user.email;
  }

  get shouldShowUsername() {
    return !!this.args.user.username;
  }
}
