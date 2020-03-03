import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default class SidebarMenu extends Component {
  @service currentUser;
}
