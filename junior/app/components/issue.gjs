import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import Bubble from './bubble';
import RobotDialog from './robot-dialog';

export default class Issue extends Component {
  @service intl;
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
      <PixButton class="pix1d-button" @triggerAction={{this.goToHome}} @iconBefore="arrow-left">{{t
          "pages.error.backHome"
        }}</PixButton>
    </div>
  </template>
}
