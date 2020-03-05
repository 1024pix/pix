import { computed } from '@ember/object';
import Component from '@ember/component';
import _capitalize from 'lodash/capitalize';

export default class ParticipantsTab extends Component {
  @computed('campaign.idPixLabel')
  get idPixLabelDisplay() {
    const idPixLabel = this.get('campaign.idPixLabel');
    return _capitalize(idPixLabel);
  }
}
