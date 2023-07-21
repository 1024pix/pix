import ApplicationAdapter from './application';

export default class ComplementaryCertificationAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/complementary-certifications/${id}/target-profiles`;
  }
}
