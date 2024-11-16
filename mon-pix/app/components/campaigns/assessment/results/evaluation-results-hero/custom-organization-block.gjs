import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import MarkdownToHtml from '../../../../markdown-to-html';

export default class EvaluationResultsCustomOrganizationBlock extends Component {
  get customButtonUrl() {
    if (this.args.campaign.customResultPageButtonUrl && this.args.campaign.customResultPageButtonText) {
      const params = {};

      if (Number.isFinite(this.args.campaignParticipationResult.masteryRate)) {
        params.masteryPercentage = Number(this.args.campaignParticipationResult.masteryRate * 100).toFixed(0);
      }
      params.externalId = this.args.campaignParticipationResult.participantExternalId ?? undefined;
      params.stage = this.args.campaignParticipationResult.reachedStage?.get('threshold') ?? undefined;

      return buildUrl(this.args.campaign.customResultPageButtonUrl, params);
    } else {
      return null;
    }
  }

  <template>
    <div class="evaluation-results-hero__organization-block">
      <h3 class="evaluation-results-hero-organization-block__title">
        {{t "pages.skill-review.organization-message"}}
      </h3>
      {{#if @campaign.customResultPageText}}
        <MarkdownToHtml
          class="evaluation-results-hero-organization-block__message"
          @isInline={{true}}
          @markdown={{@campaign.customResultPageText}}
        />
      {{/if}}
      {{#if this.customButtonUrl}}
        <PixButtonLink
          class="evaluation-results-hero-organization-block__link"
          @href={{this.customButtonUrl}}
          @variant="secondary"
        >
          {{@campaign.customResultPageButtonText}}
        </PixButtonLink>
      {{/if}}
    </div>
  </template>
}

function buildUrl(baseUrl, params) {
  const Url = new URL(baseUrl);
  const urlParams = new URLSearchParams(Url.search);
  for (const key in params) {
    if (params[key] !== undefined) {
      urlParams.set(key, params[key]);
    }
  }
  Url.search = urlParams.toString();
  return Url.toString();
}
