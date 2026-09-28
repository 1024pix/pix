import { PixButton } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import ChoiceChip from 'mon-pix/components/choice-chip';
import PageTitle from 'mon-pix/components/ui/page-title';

export default class Header extends Component {
  <template>
    <div class="user-tutorials-banner">
      <PageTitle>
        <:title>{{t "pages.user-tutorials.title"}}</:title>
        <:subtitle>{{t "pages.user-tutorials.description"}}</:subtitle>
      </PageTitle>

      <ul class="user-tutorials-banner__filters">
        <li class="user-tutorials-banner-filters__filter">
          <ChoiceChip @route="authenticated.user-tutorials.recommended">
            {{t "pages.user-tutorials.recommended"}}
          </ChoiceChip>
        </li>
        <li class="user-tutorials-banner-filters__filter">
          <ChoiceChip @route="authenticated.user-tutorials.saved">
            {{t "pages.user-tutorials.saved"}}
          </ChoiceChip>
        </li>
        {{#if @shouldShowFilterButton}}
          <li class="user-tutorials-banner-filters__filter">
            <PixButton @variant="secondary" @isBorderVisible={{false}} @triggerAction={{@onTriggerFilterButton}}>
              {{t "pages.user-tutorials.filter"}}
            </PixButton>
          </li>
        {{/if}}
      </ul>
    </div>
  </template>
  @service featureToggles;
}
