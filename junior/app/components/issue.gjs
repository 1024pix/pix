import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import Bubble from './bubble';
import RobotDialog from './robot-dialog';

export default class Issue extends Component {
  @service router;

  @action
  async goToHome() {
    this.router.transitionTo('identified.missions');
  }

  get hasMultipleMessages() {
    return Array.isArray(this.args.message);
  }

  get blobBackground() {
    return `/images/background-blob-${this.args.blobType || 'error'}.svg`;
  }

  get robotMood() {
    return `${this.args.class || 'default'}`;
  }

  get backHomeButtonVariant() {
    return this.args.refreshAction ? 'secondary' : 'primary';
  }

  <template>
    <div class="issue">
      <img src={{this.blobBackground}} alt="robot-speaker" class="blob" />
      <RobotDialog @class={{this.robotMood}}>
        {{#if this.hasMultipleMessages}}
          {{#each @message as |text|}}
            <Bubble @message={{text}} />
          {{/each}}
        {{else}}
          <Bubble @message={{@message}} />
        {{/if}}
      </RobotDialog>
      <div class="issue-buttons">
        {{#if @refreshAction}}
          <PixButton class="issue-button" @triggerAction={{@refreshAction}} @iconBefore="arrows-rotate" @size="large">
            {{t "pages.error.refresh"}}
          </PixButton>
        {{/if}}
        <PixButton
          @variant={{this.backHomeButtonVariant}}
          class="issue-button"
          @size="large"
          @triggerAction={{this.goToHome}}
          @iconBefore="arrow-left"
        >{{t "pages.error.backHome"}}</PixButton>
      </div>
    </div>
    <img src="/images/logo.svg" alt="Pix Junior" class="issue-logo" />
  </template>
}
