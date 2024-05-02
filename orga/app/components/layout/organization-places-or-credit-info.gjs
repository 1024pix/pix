import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

export default class OrganizationPlacesOrCreditInfo extends Component {
  @service currentUser;

  get canShowCredit() {
    return this.currentUser.isAdminInOrganization && this.currentUser.organization.credit > 0;
  }

  <template>
    {{#if this.currentUser.prescriber.placesManagement}}
      <div class="organization-places-or-credit-info hide-on-mobile">
        {{#if (eq @placesCount 0)}}
          <span class="organization-places-or-credit-info__warning">
            <FaIcon @icon="triangle-exclamation" class="warning-icon" />
            {{t "navigation.places.number" count=@placesCount}}</span>
        {{else}}
          <span>{{t "navigation.places.number" count=@placesCount}}</span>
        {{/if}}
        {{#if this.currentUser.isAdminInOrganization}}
          <a href="/places" class="organization-places-or-credit-info__link">{{t "navigation.places.link"}}</a>
        {{/if}}
      </div>
    {{else if this.canShowCredit}}
      <div class="organization-places-or-credit-info hide-on-mobile">
        <span>{{t "navigation.credits.number" count=this.currentUser.organization.credit}}</span>

        <PixTooltip @id="credit-info-tooltip" @position="bottom-left" @isWide={{true}} @isLight={{true}}>
          <:triggerElement>
            <FaIcon @icon="circle-info" class="info-icon" tabindex="0" aria-describedby="credit-info-tooltip" />
          </:triggerElement>
          <:tooltip>
            {{t "navigation.credits.tooltip-text" htmlSafe=true}}
          </:tooltip>
        </PixTooltip>
      </div>
    {{/if}}
  </template>
}
