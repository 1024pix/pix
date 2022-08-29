import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DeleteModal extends Component {
  @service notifications;

  get message() {
    return `Êtes-vous sûr de vouloir supprimer ce lot de place: ${this.args.organizationPlacesLot.reference} ?`;
  }

  @action
  async deleteOrganizationPlaceLot() {
    try {
      await this.args.organizationPlacesLot.deleteRecord();
      await this.args.organizationPlacesLot.save({ adapterOptions: { organizationId: this.args.organizationId } });

      this.notifications.success(`Le lot de place ${this.args.organizationPlacesLot.reference} a été supprimé.`);
    } catch (error) {
      this.notifications.error(`Le lot de place ${this.args.organizationPlacesLot.reference} n'a pas été supprimé.`);
    }

    this.args.toggle();
  }
}
