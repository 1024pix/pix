import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('navbar-header')
export default class NavbarHeader extends Component {
  burger = null;
}
