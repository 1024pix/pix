import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class ParticipationRow extends Component {
  @service notifications;
  @service accessControl;

  @tracked isEditionMode = false;
  @tracked newParticipantExternalId;

  constructor() {
    super(...arguments);
  }

  _checkIfParticipantExternalIdIsNull(newParticipantExternalId) {
    const trimedNewParticipantExternalId = newParticipantExternalId.trim();
    return trimedNewParticipantExternalId || null;
  }

  @action
  updateParticipantExternalId() {
    this.isEditionMode = false;
    this.args.participation.participantExternalId = this._checkIfParticipantExternalIdIsNull(
      this.newParticipantExternalId,
    );
    return this.args.updateParticipantExternalId(this.args.participation);
  }

  @action
  cancelUpdateParticipantExternalId() {
    this.isEditionMode = false;
    this.newParticipantExternalId = null;
  }

  @action
  editParticipantExternalId() {
    this.isEditionMode = true;
    this.newParticipantExternalId = null;
  }

  @action
  handleChange(e) {
    this.newParticipantExternalId = e.target.value;
  }
}
