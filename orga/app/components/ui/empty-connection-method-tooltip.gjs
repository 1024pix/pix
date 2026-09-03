import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { concat } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class EmptyConnectionMethodTooltip extends Component {
  @service intl;

  <template>
    <PixTooltip
      class="empty-connection-method-tooltip"
      @id={{concat "no-connection-method-tooltip-" @id}}
      @position="top"
      @isWide={{true}}
    >
      <:triggerElement>
        <PixIcon
          @name="info"
          @plainIcon={{true}}
          aria-hidden="true"
          tabindex="0"
          class="empty-connection-method-tooltip__icon"
          aria-label={{t "pages.sco-organization-participants.connection-types.no-login-method-tooltip.label"}}
          aria-describedby={{concat "no-connection-method-tooltip-" @id}}
        />
      </:triggerElement>
      <:tooltip>
        {{t "pages.sco-organization-participants.connection-types.no-login-method-tooltip.content"}}
      </:tooltip>
    </PixTooltip>
  </template>
}
