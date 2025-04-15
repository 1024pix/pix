import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { or } from 'ember-truth-helpers';

import MenuBarEntry from './entry';

export default class MenuBar extends Component {
  @service session;
  @service currentUser;
  @service accessControl;

  @action
  logout() {
    return this.session.invalidate();
  }

  <template>
    <nav class="menu-bar" aria-label={{t "components.layout.menu-bar.label"}}>
      <ul>
        <MenuBarEntry
          @path="authenticated.organizations"
          @icon="buildings"
          @title={{t "components.layout.menu-bar.entries.organizations"}}
        />
        <MenuBarEntry
          @path="authenticated.users"
          @icon="infoUser"
          @title={{t "components.layout.menu-bar.entries.users"}}
        />
        <MenuBarEntry
          @path="authenticated.certification-centers"
          @icon="mapPin"
          @title={{t "components.layout.menu-bar.entries.certification-centers"}}
          @inline={{true}}
        />
        <MenuBarEntry
          @path="authenticated.sessions"
          @icon="session"
          @title={{t "components.layout.menu-bar.entries.sessions"}}
          @inline={{true}}
        />

        {{#if this.accessControl.hasAccessToCertificationActionsScope}}
          <MenuBarEntry
            @path="authenticated.certifications"
            @icon="newRealease"
            @title={{t "components.layout.menu-bar.entries.certifications"}}
            @inline={{true}}
          />
        {{/if}}
        <MenuBarEntry
          @path="authenticated.complementary-certifications"
          @icon="extension"
          @title={{t "components.layout.menu-bar.entries.complementary-certifications"}}
          @inline={{true}}
        />
        {{#if this.accessControl.hasAccessToTargetProfilesActionsScope}}
          <MenuBarEntry
            @path="authenticated.target-profiles"
            @icon="assignment"
            @title={{t "components.layout.menu-bar.entries.target-profiles"}}
            @inline={{true}}
          />
        {{/if}}

        {{#if
          (or
            this.currentUser.adminMember.isSuperAdmin
            this.currentUser.adminMember.isMetier
            this.currentUser.adminMember.isSupport
          )
        }}
          <MenuBarEntry
            @path="authenticated.autonomous-courses"
            @icon="signpost"
            @title={{t "components.layout.menu-bar.entries.autonomous-courses"}}
          />
        {{/if}}

        {{#if this.currentUser.adminMember.isSuperAdmin}}
          <MenuBarEntry
            @path="authenticated.team"
            @icon="users"
            @title={{t "components.layout.menu-bar.entries.team"}}
          />
        {{/if}}
        {{#if this.accessControl.hasAccessToTrainings}}
          <MenuBarEntry
            @path="authenticated.trainings"
            @icon="book"
            @title={{t "components.layout.menu-bar.entries.trainings"}}
          />
        {{/if}}
        {{#if this.accessControl.hasAccessToTools}}
          <MenuBarEntry
            @path="authenticated.tools"
            @icon="tools"
            @title={{t "components.layout.menu-bar.entries.tools"}}
          />
        {{/if}}
        {{#if this.currentUser.adminMember.isSuperAdmin}}
          <MenuBarEntry
            @path="authenticated.administration"
            @icon="shieldPerson"
            @title={{t "components.layout.menu-bar.entries.administration"}}
          />
        {{/if}}

        <MenuBarEntry @path="logout" @icon="power" @title={{t "components.layout.menu-bar.entries.logout"}} />
      </ul>
    </nav>
  </template>
}
