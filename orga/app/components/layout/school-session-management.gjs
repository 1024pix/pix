import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import { t } from 'ember-intl';
dayjs.extend(LocalizedFormat);

export default class SchoolSessionManagement extends Component {
  @service currentUser;
  @service session;
  @service store;
  @service intl;

  get canManageSession() {
    return this.currentUser.canAccessMissionsPage;
  }

  get sessionIsActive() {
    return this.currentUser.organization.sessionExpirationDate > new Date();
  }

  get sessionStatus() {
    return this.sessionIsActive
      ? this.intl.t('navigation.school-sessions.status.activated')
      : this.intl.t('navigation.school-sessions.status.deactivated');
  }

  get expirationDateParameter() {
    return {
      sessionExpirationDate: dayjs(this.currentUser.organization.sessionExpirationDate).format('LT'),
    };
  }

  get buttonLabel() {
    return this.sessionIsActive
      ? this.intl.t('navigation.school-sessions.extend-button')
      : this.intl.t('navigation.school-sessions.activate-button');
  }

  @action
  async activateSession() {
    const organization = this.currentUser.organization;
    await this.store
      .adapterFor('organization')
      .activateSession({ organizationId: organization.id, token: this.session?.data?.authenticated?.access_token });

    await this.args.refreshAuthenticatedModel();
  }

  <template>
    {{#if this.canManageSession}}
      <p class="school-session__status">
        {{#if this.sessionIsActive}}
          {{t "navigation.school-sessions.status.active-label" this.expirationDateParameter}}
        {{else}}
          {{t "navigation.school-sessions.status.inactive-label"}}
        {{/if}}
      </p>
      <PixTooltip @id="school-session-info-tooltip" @position="bottom" @isWide="true">
        <:triggerElement>
          <FaIcon
            @icon="circle-info"
            tabindex="0"
            aria-label={{t "navigation.school-sessions.status.aria-label"}}
            aria-describedby="school-session-info-tooltip"
          />
        </:triggerElement>

        <:tooltip>
          {{t "navigation.school-sessions.status.info-text" htmlSafe=true}}
        </:tooltip>
      </PixTooltip>

      <PixButton
        class="school-session__button"
        @variant="secondary"
        @triggerAction={{this.activateSession}}
      >{{this.buttonLabel}}</PixButton>
    {{/if}}
  </template>
}
