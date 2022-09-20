import Model, { belongsTo, attr } from '@ember-data/model';

export const CONNECTION_TYPES = {
  empty: 'pages.sco-organization-participants.connection-types.empty',
  none: 'pages.sco-organization-participants.connection-types.none',
  email: 'pages.sco-organization-participants.connection-types.email',
  identifiant: 'pages.sco-organization-participants.connection-types.identifiant',
  mediacentre: 'pages.sco-organization-participants.connection-types.mediacentre',
};

export default class ScoOrganizationParticipant extends Model {
  @attr('string') lastName;
  @attr('string') firstName;
  @attr('date-only') birthdate;
  @attr('string') username;
  @attr('string') email;
  @attr('string') division;
  @attr('number') participationCount;
  @attr('date') lastParticipationDate;
  @attr('boolean') isAuthenticatedFromGar;
  @attr('string') campaignName;
  @attr('string') campaignType;
  @attr('string') participationStatus;
  @attr('boolean', { allowNull: true }) isCertifiable;
  @attr('date') certifiableAt;
  @belongsTo('organization') organization;

  get hasUsername() {
    return Boolean(this.username);
  }

  get hasEmail() {
    return Boolean(this.email);
  }

  get authenticationMethods() {
    const messages = [];

    if (!this.isAssociated) messages.push(CONNECTION_TYPES['empty']);
    if (this.hasEmail) messages.push(CONNECTION_TYPES['email']);
    if (this.hasUsername) messages.push(CONNECTION_TYPES['identifiant']);
    if (this.isAuthenticatedFromGar) messages.push(CONNECTION_TYPES['mediacentre']);

    return messages;
  }

  get isAssociated() {
    return Boolean(this.hasEmail || this.hasUsername || this.isAuthenticatedFromGar);
  }

  get isAuthenticatedWithGarOnly() {
    return Boolean(!this.hasUsername && !this.hasEmail && this.isAuthenticatedFromGar);
  }

  get displayAddUsernameAuthentication() {
    return Boolean(!this.hasUsername && (this.isAuthenticatedFromGar || this.hasEmail));
  }
}
