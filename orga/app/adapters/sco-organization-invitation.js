import ApplicationAdapter from './application';

export default class ScoOrganizationInvitationAdapter extends ApplicationAdapter {
  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/organization-invitations/sco`;
  }
}
