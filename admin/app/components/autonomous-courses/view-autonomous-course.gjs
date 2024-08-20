import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';

export default class ViewAutonomousCourse extends Component {
  @tracked linkHasJustBeenCopied = false;

  displayedAttributes = [
    { label: 'Id', value: this.args.autonomousCourse.id },
    { label: 'Nom interne', value: this.args.autonomousCourse.internalTitle },
    { label: 'Nom public', value: this.args.autonomousCourse.publicTitle },
    { label: "Texte de la page d'accueil", value: this.args.autonomousCourse.customLandingPageText },
    { label: 'Date de création', value: dayjs(this.args.autonomousCourse.createdAt).format('DD/MM/YYYY') },
  ];

  constructor() {
    super(...arguments);
  }

  get tooltipLabel() {
    return this.linkHasJustBeenCopied ? 'Lien copié !' : 'Copier le lien de la campagne';
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

      <dt class="autonomous-course-card__details-label">Lien public&nbsp;:&nbsp;</dt>
      <dd class="autonomous-course-card__details-value">
        <a
          href={{this.campaignLink}}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Lien vers la campagne {{@autonomousCourse.code}} (nouvelle fenêtre)"
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
