import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class ScoHeaderActions extends Component {
  @service currentUser;
  @service session;
  @service intl;
}
