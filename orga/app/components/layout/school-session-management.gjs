import { PixButton, PixIcon, PixTooltip } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import CopyPasteButton from '../copy-paste-button';

export default class SchoolSessionManagement extends Component {
  @service currentUser;
  @service session;
  @service store;
  @service intl;

  get canManageSession() {
    return this.currentUser.canAccessMissionsPage;
  }
  get activateSessionButtonClass() {
    return this.sessionIsActive ? 'secondary' : 'primary';
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
      sessionExpirationDate: this.intl.formatTime(this.currentUser.organization.sessionExpirationDate, {
        format: 'hhmm',
      }),
    };
  }

  get buttonLabel() {
    return this.sessionIsActive
      ? this.intl.t('navigation.school-sessions.extend-button')
      : this.intl.t('navigation.school-sessions.activate-button');
  }
  get organizationCode() {
    return this.currentUser.organization.schoolCode ?? '';
  }

  @action
  async activateSession() {
    const organization = this.currentUser.organization;
    await this.store
      .adapterFor('organization')
      .activateSession({ organizationId: organization.id, token: this.session?.data?.authenticated?.access_token });

    await this.currentUser.load();
  }

  <template>
    {{#if this.canManageSession}}
      <div class="school-code-container">
        <h2>{{t "navigation.school-sessions.status.code-label"}}</h2>
        <p>{{this.organizationCode}}
          <CopyPasteButton
            @clipBoardtext={{this.organizationCode}}
            @successMessage="{{t 'pages.missions.list.banner.copypaste-container.button.success'}}"
            @defaultMessage="{{t 'pages.missions.list.banner.copypaste-container.button.tooltip'}}"
          />
        </p>

      </div>

      <PixButton
        class="school-session__button"
        @variant={{this.activateSessionButtonClass}}
        @triggerAction={{this.activateSession}}
      >{{this.buttonLabel}}</PixButton>
      <div class="school-session__status">

        {{#if this.sessionIsActive}}
          {{t "navigation.school-sessions.status.active-label" this.expirationDateParameter}}
        {{else}}
          {{t "navigation.school-sessions.status.inactive-label"}}
        {{/if}}
        <PixTooltip @id="school-session-info-tooltip" @position="bottom" @isWide="true">
          <:triggerElement>
            <PixIcon
              @name="error"
              @plainIcon={{true}}
              tabindex="0"
              aria-label={{t "navigation.school-sessions.status.aria-label"}}
              aria-describedby="school-session-info-tooltip"
            />
          </:triggerElement>

          <:tooltip>
            {{t "navigation.school-sessions.status.info-text" htmlSafe=true}}
          </:tooltip>
        </PixTooltip>
      </div>
    {{/if}}
  </template>
}
