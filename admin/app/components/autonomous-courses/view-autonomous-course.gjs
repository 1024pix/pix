import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import { t } from 'ember-intl';

import SafeMarkdownToHtml from '../safe-markdown-to-html';

export default class ViewAutonomousCourse extends Component {
  @service intl;
  @tracked linkHasJustBeenCopied = false;

  autonomousCourse = this.args.autonomousCourse;

  translatedLabel = (label) => this.intl.t(`components.autonomous-courses.view.labels.${label}`);

  displayedAttributes = [
    {
      label: this.translatedLabel('created-date'),
      value: dayjs(this.args.autonomousCourse.createdAt).format('DD/MM/YYYY'),
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
    <dl class="page-details">

      {{#each this.displayedAttributes as |attribute|}}
        <dt class="page-details__label">{{attribute.label}}&nbsp;:&nbsp;</dt>
        <dd class="page-details__value">{{attribute.value}}</dd>
      {{/each}}

      <dt class="page-details__label">
        {{t "components.autonomous-courses.view.labels.custom-landing-page"}}&nbsp;:&nbsp;
      </dt>
      <dd class="page-details__value">
        <blockquote>
          <SafeMarkdownToHtml @markdown={{@autonomousCourse.customLandingPageText}} />
        </blockquote>
      </dd>

      <dt class="page-details__label">{{t "components.autonomous-courses.view.link-title"}}&nbsp;:&nbsp;</dt>
      <dd class="page-details__value">
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
      </dd>
    </dl>
  </template>
}
