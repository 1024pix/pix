import Component from '@glimmer/component';

export default class UserAccountPanel extends Component {

  get displayUsername() {
    return !!this.args.user.username;
  }
}
