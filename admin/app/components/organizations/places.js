import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Places extends Component {
  @service accessControl;

  @tracked displayDeletePlacesLotModal = false;
  @tracked organizationPlacesLotToDelete = null;

  @action
  async toggleDisplayDeletePlacesLotModal(placeLot) {
    this.displayDeletePlacesLotModal = !this.displayDeletePlacesLotModal;

    if (this.displayDeletePlacesLotModal) {
      this.organizationPlacesLotToDelete = placeLot;
    } else {
      this.organizationPlacesLotToDelete = null;
    }
  }
}
