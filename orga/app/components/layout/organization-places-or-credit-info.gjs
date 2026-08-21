import { PixIcon, PixTooltip } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

export default class OrganizationPlacesOrCreditInfo extends Component {
  @service currentUser;

  get canShowCredit() {
    const canShow = this.currentUser.isAdminInOrganization && this.currentUser.organization.credit > 0;
    this.args.onCanShowCredit?.(canShow);
    return canShow;
  }

  <template>
    {{#if this.currentUser.prescriber.placesManagement}}
      <div class="organization-places-or-credit-info">
        {{#if (eq @placesCount 0)}}
          <span class="organization-places-or-credit-info__warning">
            <PixIcon @name="warning" @plainIcon={{true}} class="warning-icon" />
            {{t "navigation.places.number" count=@placesCount}}</span>
        {{else}}
          <span>{{t "navigation.places.number" count=@placesCount}}</span>
        {{/if}}
      </div>
    {{else if this.canShowCredit}}
      <div class="organization-places-or-credit-info">
        <span>{{t "navigation.credits.number" count=this.currentUser.organization.credit}}</span>

        <PixTooltip @id="credit-info-tooltip" @position="auto" @isWide={{true}} @isLight={{true}}>
          <:triggerElement>
            <PixIcon
              @name="help"
              @plainIcon={{true}}
              class="info-icon"
              tabindex="0"
              aria-describedby="credit-info-tooltip"
            />
          </:triggerElement>
          <:tooltip>
            {{t "navigation.credits.tooltip-text" htmlSafe=true}}
          </:tooltip>
        </PixTooltip>
      </div>
    {{/if}}
  </template>
}
