import ApplicationAdapter from './application';

export default class OrganizationInvitation extends ApplicationAdapter {

  urlForCreateRecord(modelName, { adapterOptions }) {
    const { organizationId } = adapterOptions;

    return `${this.host}/${this.namespace}/organizations/${organizationId}/invitations`;
  }

  createRecord() {
    return super.createRecord(...arguments).then((response) => {
      response.data = response.data[0];
      return response;
    });
  }
}
