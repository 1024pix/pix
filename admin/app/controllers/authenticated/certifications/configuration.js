import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ConfigurationController extends Controller {
  @service store;
  @service notifications;
  competenceScoringConfiguration = '';
  certificationScoringConfiguration = '';

  @action
  onCompetenceScoringConfigurationChange(event) {
    this.competenceScoringConfiguration = event.target.value;
  }

  @action
  async onCompetenceScoringConfigurationSubmit(event) {
    event.preventDefault();
    const adapter = this.store.adapterFor('scoring-configuration');
    try {
      await adapter.updateCompetenceScoringConfiguration(this.competenceScoringConfiguration);
      this.notifications.success('Configuration enregistrée');
    } catch (e) {
      this.notifications.error("La config n'a pas pu être ajoutée");
    }
  }

  @action
  onCertificationScoringConfigurationChange(event) {
    this.certificationScoringConfiguration = event.target.value;
  }

  @action
  async onCertificationScoringConfigurationSubmit(event) {
    event.preventDefault();
    const adapter = this.store.adapterFor('scoring-configuration');
    try {
      await adapter.updateCertificationScoringConfiguration(this.certificationScoringConfiguration);
      this.notifications.success('Configuration enregistrée');
    } catch (e) {
      this.notifications.error("La config n'a pas pu être ajoutée");
    }
  }
}
