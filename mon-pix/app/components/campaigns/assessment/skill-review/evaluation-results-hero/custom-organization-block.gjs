import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import MarkdownToHtml from '../../../../markdown-to-html';

export default class EvaluationResultsHeroCustomOrganizationBlock extends Component {
  get hasCustomOrganizationLink() {
    return this.args.customResultPageButtonUrl && this.args.customResultPageButtonText;
  }

  get showOrganizationContent() {
    return this.args.customResultPageText || this.hasCustomOrganizationLink;
  }

  <template>
    {{#if this.showOrganizationContent}}
      <div class="evaluation-results-hero__organization-block">
        <h3 class="evaluation-results-hero-organization-block__title">
          {{t "pages.skill-review.organization-message"}}
        </h3>
        {{#if @customResultPageText}}
          <MarkdownToHtml
            class="evaluation-results-hero-organization-block__message"
            @isInline={{true}}
            @markdown={{@customResultPageText}}
          />
        {{/if}}
        {{#if this.hasCustomOrganizationLink}}
          <PixButtonLink
            class="evaluation-results-hero-organization-block__link"
            @href={{@customResultPageButtonUrl}}
            @variant="secondary"
          >
            {{@customResultPageButtonText}}
          </PixButtonLink>
        {{/if}}
      </div>
    {{/if}}
  </template>
}
