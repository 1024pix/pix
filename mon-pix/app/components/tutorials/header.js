import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Header extends Component {
  @service featureToggles;
}
