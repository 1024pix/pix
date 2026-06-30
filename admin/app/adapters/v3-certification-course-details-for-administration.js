import ApplicationAdapter from './application';

export default class V3CertificationCourseDetailsForAdministration extends ApplicationAdapter {
  urlForFindRecord(certificationCourseId) {
    return `${this.host}/${this.namespace}/certification-courses-v3/${certificationCourseId}/details`;
  }
}
