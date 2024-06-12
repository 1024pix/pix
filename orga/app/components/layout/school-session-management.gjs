import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class SchoolSessionManagement extends Component {
  @service currentUser;
  @service session;
  @service store;

  get canManageSession() {
    return this.currentUser.canAccessMissionsPage;
  }

  @action
  activateSession() {
    const organization = this.currentUser.organization;
    return this.store
      .adapterFor('organization')
      .activateSession({ organizationId: organization.id, token: this.session?.data?.authenticated?.access_token });
  }

  <template>
    {{#if this.canManageSession}}
      <PixButton class="button-activate-session" @variant="secondary" @triggerAction={{this.activateSession}}>{{t
          "navigation.school-sessions.activate-button"
        }}</PixButton>
    {{/if}}
  </template>
}
