import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@glimmer/component';

export default class NavbarMobileHeader extends Component {
  @service session;

  @alias('session.isAuthenticated') isUserLogged;
}
