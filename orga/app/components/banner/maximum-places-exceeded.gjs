import { PixBannerAlert } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class MaximumPlacesExceeded extends Component {
  @service currentUser;

  get displayMaximumPlacesLimitBanner() {
    return this.currentUser.placeStatistics?.hasReachedMaximumPlacesLimit;
  }

  <template>
    {{#if this.displayMaximumPlacesLimitBanner}}
      <PixBannerAlert @type="error">
        {{t
          "banners.maximum-places-exceeded.message"
          htmlSafe=true
          linkClasses="link link--banner link--bold link--underlined"
        }}
      </PixBannerAlert>
    {{/if}}
  </template>
}
