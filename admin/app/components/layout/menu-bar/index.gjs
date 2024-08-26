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
          @icon="building"
          @title={{t "components.layout.menu-bar.entries.organizations"}}
        />
        <MenuBarEntry
          @path="authenticated.users"
          @icon="user"
          @title={{t "components.layout.menu-bar.entries.users"}}
        />
        <MenuBarEntry
          @path="authenticated.certification-centers"
          @icon="map-pin"
          @title={{t "components.layout.menu-bar.entries.certification-centers"}}
          @inline={{true}}
        />
        <MenuBarEntry
          @path="authenticated.sessions"
          @icon="chalkboard-user"
          @title={{t "components.layout.menu-bar.entries.sessions"}}
          @inline={{true}}
        />

        {{#if this.accessControl.hasAccessToCertificationActionsScope}}
          <MenuBarEntry
            @path="authenticated.certifications"
            @icon="graduation-cap"
            @title={{t "components.layout.menu-bar.entries.certifications"}}
            @inline={{true}}
          />
        {{/if}}
        <MenuBarEntry
          @path="authenticated.complementary-certifications"
          @icon="stamp"
          @title={{t "components.layout.menu-bar.entries.complementary-certifications"}}
          @inline={{true}}
        />
        {{#if this.accessControl.hasAccessToTargetProfilesActionsScope}}
          <MenuBarEntry
            @path="authenticated.target-profiles"
            @icon="clipboard-list"
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
            @icon="signs-post"
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
            @icon="book-open"
            @title={{t "components.layout.menu-bar.entries.trainings"}}
          />
        {{/if}}
        {{#if (or this.currentUser.adminMember.isSuperAdmin this.currentUser.adminMember.isMetier)}}
          <MenuBarEntry
            @path="authenticated.tools"
            @icon="screwdriver-wrench"
            @title={{t "components.layout.menu-bar.entries.tools"}}
          />
        {{/if}}
        {{#if this.currentUser.adminMember.isSuperAdmin}}
          <MenuBarEntry
            @path="authenticated.administration"
            @icon="crown"
            @title={{t "components.layout.menu-bar.entries.administration"}}
          />
        {{/if}}

        <MenuBarEntry @path="logout" @icon="power-off" @title={{t "components.layout.menu-bar.entries.logout"}} />
      </ul>
    </nav>
  </template>
}
