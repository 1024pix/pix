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

  <template>
    <div class="issue">
      <img src="/images/background-blob-error.svg" alt="error_background_image" class="blob" />
      <RobotDialog @class="sad">
        <Bubble @message={{@message}} />
      </RobotDialog>
      <PixButton class="pix1d-button" @triggerAction={{this.goToHome}} @iconBefore="arrow-left">{{t
          "pages.error.backHome"
        }}</PixButton>
    </div>
  </template>
}
