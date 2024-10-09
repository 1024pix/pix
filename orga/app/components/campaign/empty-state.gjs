import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import CopyPasteButton from '../copy-paste-button';

export default class EmptyState extends Component {
  @service url;

  get campaignCode() {
    return this.args.campaignCode;
  }

  get campaignUrl() {
    return `${this.url.campaignsRootUrl}${this.campaignCode}`;
  }

  <template>
    <section class="panel empty-state">
      <img src="{{this.rootURL}}/images/empty-state.svg" alt="" role="none" />

      <div class="empty-state__text">
        {{#if this.campaignCode}}
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
    </section>
  </template>
}
