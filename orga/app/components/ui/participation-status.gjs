import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class ParticipationStatus extends Component {
  @service intl;

  get color() {
    const { status } = this.args;
    return COLORS[status];
  }

  get label() {
    const { status } = this.args;
    return this.intl.t(`components.participation-status.${status}`);
  }

  <template>
    <PixTag @color={{this.color}}>
      {{this.label}}
    </PixTag>
  </template>
}

const COLORS = {
  STARTED: 'yellow-light',
  SHARED: 'green-light',
};
