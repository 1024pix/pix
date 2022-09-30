import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { types } from '../../../models/certification-center';

export default class AuthenticatedCertificationCentersGetController extends Controller {
  certificationCenterTypes = types;

  @service notifications;
  @service store;

  @tracked isEditMode = false;
  @tracked selectedCertificationCenterType;

  @action
  selectCertificationCenterType(event) {
    this.model.certificationCenter.type = event.target.value;
  }

  @action
  async updateCertificationCenter(certificationCenterData) {
    this.model.certificationCenter.name = certificationCenterData.name;
    this.model.certificationCenter.externalId = certificationCenterData.externalId;
    this.model.certificationCenter.type = certificationCenterData.type;
    this.model.certificationCenter.isSupervisorAccessEnabled = certificationCenterData.isSupervisorAccessEnabled;
    this.model.certificationCenter.habilitations = certificationCenterData.habilitations;

    try {
      await this.model.certificationCenter.save();
      this.notifications.success('Centre de certification mis à jour avec succès.');
    } catch (e) {
      this.notifications.error("Une erreur est survenue, le centre de certification n'a pas été mis à jour.");
    }
  }
}
