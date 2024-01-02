import Component from '@glimmer/component';
import { action } from '@ember/object';
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
}
