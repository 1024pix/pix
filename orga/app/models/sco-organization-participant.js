import Model, { belongsTo, attr } from '@ember-data/model';

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

    if (!this.isAssociated) messages.push('empty');
    if (this.hasEmail) messages.push('email');
    if (this.hasUsername) messages.push('identifiant');
    if (this.isAuthenticatedFromGar) messages.push('mediacentre');

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
