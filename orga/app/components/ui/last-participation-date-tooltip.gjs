import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { concat } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class LastParticipationDateTooltip extends Component {
  @service intl;

  get campaignTypeLabel() {
    return this.intl.t(
      `pages.participants-list.latest-participation-information-tooltip.campaign-${this.args.campaignType}-type`,
    );
  }

  get participationStatusLabel() {
    if (this.args.participationStatus === 'TO_SHARE') {
      return this.intl.t(
        `pages.participants-list.latest-participation-information-tooltip.participation-STARTED-status`,
      );
    }
    return this.intl.t(
      `pages.participants-list.latest-participation-information-tooltip.participation-${this.args.participationStatus}-status`,
    );
  }

  <template>
    <PixTooltip
      @id={{concat "last-participation-date-tooltip-" @id}}
      @position="left"
      @isWide={{true}}
      class="last-participation-date-tooltip"
    >
      <:triggerElement>
        <PixIcon
          @name="info"
          @plainIcon={{true}}
          aria-hidden="true"
          tabindex="0"
          aria-label={{t "pages.participants-list.latest-participation-information-tooltip.aria-label"}}
          aria-describedby={{concat "last-participation-date-tooltip-" @id}}
          class="last-participation-date-tooltip__icon"
        />
      </:triggerElement>
      <:tooltip>
        <ul>
          <li>
            {{t "pages.participants-list.latest-participation-information-tooltip.campaign-name"}}
            <span class="last-participation-date-tooltip__informations">{{@campaignName}}</span>
          </li>
          <li>
            {{t "pages.participants-list.latest-participation-information-tooltip.campaign-type"}}
            <span class="last-participation-date-tooltip__informations">{{this.campaignTypeLabel}}</span>
          </li>
          <li>{{t "pages.participants-list.latest-participation-information-tooltip.campaign-status"}}
            <span class="last-participation-date-tooltip__informations">{{this.participationStatusLabel}}</span>
          </li>
        </ul>
      </:tooltip>
    </PixTooltip>
  </template>
}
