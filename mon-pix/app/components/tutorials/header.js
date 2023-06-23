import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class Header extends Component {
  @service featureToggles;
}
