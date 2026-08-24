import { PixIcon, PixTooltip } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { DescriptionList } from 'pix-admin/components/ui/description-list';

import SafeMarkdownToHtml from '../safe-markdown-to-html';

export default class ViewAutonomousCourse extends Component {
  @service intl;
  @tracked linkHasJustBeenCopied = false;

  autonomousCourse = this.args.autonomousCourse;

  translatedLabel = (label) => this.intl.t(`components.autonomous-courses.view.labels.${label}`);

  displayedAttributes = [
    {
      label: this.translatedLabel('created-date'),
      value: this.intl.formatDate(this.args.autonomousCourse.createdAt),
    },
    { label: this.translatedLabel('internal-title'), value: this.args.autonomousCourse.internalTitle },
    { label: this.translatedLabel('public-title'), value: this.args.autonomousCourse.publicTitle },
  ];

  constructor() {
    super(...arguments);
  }

  get tooltipLabel() {
    const linkCopyAction = this.intl.t('components.autonomous-courses.view.link-copy-action');
    const linkCopyValidation = this.intl.t('components.autonomous-courses.view.link-copy-validation');

    return this.linkHasJustBeenCopied ? linkCopyValidation : linkCopyAction;
  }

  get campaignLink() {
    const updatedOrigin = window.origin.replace('admin', 'app');
    return `${updatedOrigin}/campagnes/${this.args.autonomousCourse.code}`;
  }

  @action
  async copyCampaignLink() {
    await navigator.clipboard.writeText(this.campaignLink);
    this.linkHasJustBeenCopied = true;
    setTimeout(() => {
      this.linkHasJustBeenCopied = false;
    }, 2000);
  }

  <template>
    <DescriptionList>

      {{#each this.displayedAttributes as |attribute|}}
        <DescriptionList.Item @label={{attribute.label}}>
          {{attribute.value}}
        </DescriptionList.Item>

      {{/each}}

      <DescriptionList.Item @label={{t "components.autonomous-courses.view.labels.custom-landing-page"}}>
        <blockquote>
          <SafeMarkdownToHtml @markdown={{@autonomousCourse.customLandingPageText}} />
        </blockquote>
      </DescriptionList.Item>

      <DescriptionList.Item
        @label={{t "components.autonomous-courses.view.link-title"}}
        class="view-autonomous-course__copy-link"
      >
        <a
          href={{this.campaignLink}}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={{t "components.autonomous-courses.view.link-label" code=@autonomousCourse.code}}
        >
          {{this.campaignLink}}
        </a>
        <PixTooltip @id="tooltip-clipboard-button" @isInline={{true}}>
          <:triggerElement>
            <button type="button" {{on "click" this.copyCampaignLink}} aria-label="{{this.tooltipLabel}}">
              <PixIcon @name="copy" />
            </button>
          </:triggerElement>
          <:tooltip>{{this.tooltipLabel}}</:tooltip>
        </PixTooltip>
      </DescriptionList.Item>

    </DescriptionList>
  </template>
}
