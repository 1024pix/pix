import ApplicationAdapter from './application';

export default class ScoringConfigurationAdapter extends ApplicationAdapter {
  updateCompetenceScoringConfiguration(newConfiguration) {
    const url = `${this.host}/${this.namespace}/admin/competence-for-scoring-configuration`;
    return this.ajax(url, 'POST', { data: newConfiguration });
  }

  updateCertificationScoringConfiguration(newConfiguration) {
    const url = `${this.host}/${this.namespace}/admin/certification-scoring-configuration`;
    return this.ajax(url, 'POST', { data: newConfiguration });
  }
}
