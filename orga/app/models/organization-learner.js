import Model, { attr } from '@ember-data/model';

export default class OrganizationLearner extends Model {
  @attr('string') lastName;
  @attr('string') firstName;
  @attr('string') username;
  @attr('string') division;
  @attr('string') group;
  @attr('string') email;
  @attr authenticationMethods;
  @attr('boolean') isCertifiable;
  @attr('date', { allowNull: true }) certifiableAt;

  get authenticationMethodsList() {
    const connectionMethodsList = [];

    if (this.email) connectionMethodsList.push('email');
    if (this.username) connectionMethodsList.push('identifiant');
    if (this.authenticationMethods.includes('GAR')) connectionMethodsList.push('mediacentre');
    if (connectionMethodsList.length === 0) connectionMethodsList.push('empty');
    return connectionMethodsList;
  }
}
