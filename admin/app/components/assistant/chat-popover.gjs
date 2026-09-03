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
  @service intl;

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

  get t() {
    return (key, options) => this.intl.t(key, options);
  }

  get toggleAriaLabel() {
    return this.intl.t('components.assistant.toggle-button.aria-label');
  }

  get panelAriaLabel() {
    return this.intl.t('components.assistant.panel.aria-label');
  }

  <template>
    <button type="button" class="chat-toggle-btn" aria-label={{this.toggleAriaLabel}} {{on "click" this.toggle}}>
      💬
    </button>
    <div
      class="chat-panel"
      role="region"
      aria-label={{this.panelAriaLabel}}
      style={{if this.isOpen "" "display: none;"}}
    >
      <ReactBridge
        @reactComponent={{AssistantApp}}
        @props={{hash getAccessToken=this.getAccessToken onNavigateToOrganization=this.navigateToOrganization t=this.t}}
      />
    </div>
  </template>
}
