import { classNames } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('navbar-mobile-header')
export default class NavbarMobileHeader extends Component {
  @service session;

  @alias('session.isAuthenticated')
  isUserLogged;

  burger = null;
}
