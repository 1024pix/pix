import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AttachTargetProfile extends Component {
  @tracked targetProfileToAttach = this.targetProfiles[0].value;

  get targetProfiles() {
    return [
      {
        label: 'Profil cible 1',
        value: 'coucou',
      },
    ];
  }

  @action
  onChange(value) {
    this.targetProfileToAttach = value;
  }
}
