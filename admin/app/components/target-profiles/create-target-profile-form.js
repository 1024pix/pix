import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class UpdateTargetProfile extends Component {
  @service notifications;

  constructor() {
    super(...arguments);
    this.optionsList = [
      {
        value: 'OTHER',
        label: 'Autre',
      },
      {
        value: 'COMPETENCES',
        label: 'Compétences Pix',
      },
      {
        value: 'DISCIPLINE',
        label: 'Disciplinaire',
      },
      {
        value: 'PREDEFINED',
        label: 'Prédéfini',
      },
      {
        value: 'CUSTOM',
        label: 'Sur-mesure',
      },
      {
        value: 'SUBJECT',
        label: 'Thématique',
      },
    ];
  }
  @action
  onCategoryChange(event) {
    this.args.targetProfile.category = event.target.value;
  }
}
