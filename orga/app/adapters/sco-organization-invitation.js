import ApplicationAdapter from './application';

export default class ScoOrganizationInvitation extends ApplicationAdapter {

  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/organization-invitations/sco`;
  }
}
