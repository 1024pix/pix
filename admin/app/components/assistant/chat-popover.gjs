import { hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ReactBridge from 'pix-admin/components/react-bridge';

import AssistantApp from './react/AssistantApp.jsx';

export default class ChatPopover extends Component {
  @service session;
  @service router;

  @tracked isOpen = false;

  @action
  toggle() {
    this.isOpen = !this.isOpen;
  }

  @action
  getAccessToken() {
    return Promise.resolve(this.session.data?.authenticated?.access_token);
  }

  @action
  navigateToOrganization(id) {
    this.router.transitionTo('authenticated.organizations.get', id);
  }

  <template>
    <button type="button" class="chat-toggle-btn" aria-label="Ouvrir l'assistant" {{on "click" this.toggle}}>
      💬
    </button>
    {{#if this.isOpen}}
      <div class="chat-panel" role="region" aria-label="Panneau assistant">
        <ReactBridge
          @reactComponent={{AssistantApp}}
          @props={{hash getAccessToken=this.getAccessToken onNavigateToOrganization=this.navigateToOrganization}}
        />
      </div>
    {{/if}}
  </template>
}
