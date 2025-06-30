import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import SignIn from 'auth/components/sign-in';
import pageTitle from 'ember-page-title/helpers/page-title';
import { on } from '@ember/modifier';

export default class ApplicationTemplate extends Component {
  @service session;

  @action
  invalidateSession() {
    this.session.invalidate();
  }

  <template>
    {{pageTitle "Auth"}}

    {{#if this.session.isAuthenticated}}
      <button type="button" {{on "click" this.invalidateSession}}>
        Logout
      </button>
    {{else}}
      <SignIn />
    {{/if}}

    {{outlet}}
  </template>
}
