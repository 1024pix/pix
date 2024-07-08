import ApplicationAdapter from './application';

export default class OrganizationLearner extends ApplicationAdapter {
  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/organization-learners/reconcile`;
  }

  async createRecord(_, type, snapshot) {
    const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');

    const data = this.serialize(snapshot);

    await this.ajax(url, 'POST', { data });

    return { data: { id: 'success', type: 'organization-learner' } };
  }
}
