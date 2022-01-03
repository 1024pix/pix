import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class UpdateTargetProfile extends Component {
  @service notifications;

  constructor() {
    super(...arguments);
    this.optionsList = [
      {
        value: 'COMPETENCES',
        label: 'Compétences Pix',
      },
      {
        value: 'CUSTOM',
        label: 'Sur-mesure',
      },
      {
        value: 'DISCIPLINE',
        label: 'Disciplinaire',
      },
      {
        value: 'OTHER',
        label: 'Autre',
      },
      {
        value: 'PREDEFINED',
        label: 'Prédéfini',
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
