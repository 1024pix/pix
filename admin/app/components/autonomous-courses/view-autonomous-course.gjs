import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import { t } from 'ember-intl';

export default class ViewAutonomousCourse extends Component {
  @service intl;
  @tracked linkHasJustBeenCopied = false;

  internalTitleLabel = this.intl.t('components.autonomous-course.view.labels.internal-title');
  publicTitleLabel = this.intl.t('components.autonomous-course.view.labels.public-title');
  customLandingPageLabel = this.intl.t('components.autonomous-course.view.labels.custom-landing-page');
  createdDateLabel = this.intl.t('components.autonomous-course.view.labels.created-date');

  displayedAttributes = [
    { label: 'Id', value: this.args.autonomousCourse.id },
    { label: this.internalTitleLabel, value: this.args.autonomousCourse.internalTitle },
    { label: this.publicTitleLabel, value: this.args.autonomousCourse.publicTitle },
    { label: this.customLandingPageLabel, value: this.args.autonomousCourse.customLandingPageText },
    { label: this.createdDateLabel, value: dayjs(this.args.autonomousCourse.createdAt).format('DD/MM/YYYY') },
  ];

  constructor() {
    super(...arguments);
  }

  get tooltipLabel() {
    const linkCopyAction = this.intl.t('components.autonomous-course.view.link-copy-action');
    const linkCopyValidation = this.intl.t('components.autonomous-course.view.link-copy-validation');

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
    <dl class="autonomous-course-card__details">

      {{#each this.displayedAttributes as |attribute|}}
        <dt class="autonomous-course-card__details-label">{{attribute.label}}&nbsp;:&nbsp;</dt>
        <dd class="autonomous-course-card__details-value">{{attribute.value}}</dd>
      {{/each}}

      <dt class="autonomous-course-card__details-label">{{t
          "components.autonomous-course.view.link-title"
        }}&nbsp;:&nbsp;</dt>
      <dd class="autonomous-course-card__details-value">
        <a
          href={{this.campaignLink}}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={{t "components.autonomous-course.view.link-label" code=@autonomousCourse.code}}
          class="autonomous-course-card-details-value__link"
        >
          {{this.campaignLink}}
        </a>
        <PixTooltip
          class="autonomous-course-card-details-value__tooltip"
          @id="tooltip-clipboard-button"
          @isInline={{true}}
        >
          <:triggerElement>
            <button type="button" {{on "click" this.copyCampaignLink}} aria-label="{{this.tooltipLabel}}">
              <FaIcon @icon="copy" prefix="fas" />
            </button>
          </:triggerElement>
          <:tooltip>{{this.tooltipLabel}}</:tooltip>
        </PixTooltip>
      </dd>
    </dl>
  </template>
}
