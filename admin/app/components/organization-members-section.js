/* eslint-disable ember/require-tagless-components */
/* eslint-disable ember/no-classic-components */

import Component from '@ember/component';
import { action } from '@ember/object';

export default class OrganizationMembersSection extends Component {

  @action
  selectRole(event) {
    return this.selectRoleForSearch(event.target.value || null);
  }
}
