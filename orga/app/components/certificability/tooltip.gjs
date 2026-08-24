import { PixIcon, PixTooltip } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class Tooltip extends Component {
  @service currentUser;
  @service intl;

  get certificabilityDescription() {
    if (this.args.hasComputeOrganizationLearnerCertificabilityEnabled) {
      return this.intl.t('components.certificability-tooltip.from-compute-certificability');
    }

    return this.intl.t('components.certificability-tooltip.from-collect-notice');
  }

  <template>
    <div class="certificability-tooltip">
      <PixTooltip @id="column-is-certifiable-informations" @position="top-left" @isWide={{true}}>
        <:triggerElement>
          <PixIcon
            @name="help"
            @plainIcon={{true}}
            aria-hidden="true"
            tabindex="0"
            aria-label={{t "components.certificability-tooltip.aria-label"}}
            aria-describedby="column-is-certifiable-informations"
          />
        </:triggerElement>
        <:tooltip>
          <span>{{t "components.certificability-tooltip.content"}}</span>
          <span>{{this.certificabilityDescription}}</span>
        </:tooltip>
      </PixTooltip>
    </div>
  </template>
}
