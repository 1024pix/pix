import Model, { hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class User extends Model {

  @attr() firstName;
  @attr() lastName;
  @attr() email;
  @attr() username;
  @attr('boolean') cgu;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @attr('boolean') pixCertifTermsOfServiceAccepted;

  @computed('cgu')
  get isPixTermsOfServiceAccepted() {
    const value = this.cgu;
    return value ? 'Oui' : 'Non';
  }

  @computed('pixOrgaTermsOfServiceAccepted')
  get isPixOrgaTermsOfServiceAccepted() {
    const value = this.pixOrgaTermsOfServiceAccepted;
    return value ? 'Oui' : 'Non';
  }

  @computed('pixCertifTermsOfServiceAccepted')
  get isPixCertifTermsOfServiceAccepted() {
    const value = this.pixCertifTermsOfServiceAccepted;
    return value ? 'Oui' : 'Non';
  }

  @hasMany('membership') memberships;
}
