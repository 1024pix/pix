import { PixBlock } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import CopyPasteButton from '../copy-paste-button';

export default class EmptyState extends Component {
  @service url;

  get displayCopyPasteButton() {
    return this.args.campaignCode && !this.args.isFromCombinedCourse;
  }

  get campaignUrl() {
    return `${this.url.campaignsRootUrl}${this.args.campaignCode}`;
  }

  <template>
    <PixBlock class="empty-state" @variant="orga">
      <img src="{{this.rootURL}}/images/empty-state.svg" alt="" role="none" />

      <div class="empty-state__text">
        {{#if this.displayCopyPasteButton}}
          <p>{{t "pages.campaign.empty-state-with-copy-link"}}</p>

          <CopyPasteButton
            @clipBoardtext={{this.campaignUrl}}
            @successMessage={{t "pages.campaign.copy.link.success"}}
            @defaultMessage={{t "pages.campaign.copy.link.default"}}
          />
        {{else}}
          <p>{{t "pages.campaign.empty-state"}}</p>
        {{/if}}
      </div>
    </PixBlock>
  </template>
}
