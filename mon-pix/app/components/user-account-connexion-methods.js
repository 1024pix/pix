import Component from '@glimmer/component';

export default class UserAccountConnexionMethodsComponent extends Component {

  get displayEmail() {
    return !!this.args.user.email;
  }

  get displayUsername() {
    return !!this.args.user.username;
  }
}
