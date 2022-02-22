import Model, { attr } from '@ember-data/model';

export default class CertificationCandidate extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('string') birthCity;
  @attr('string') birthProvinceCode;
  @attr('string') birthCountry;
  @attr('string') birthPostalCode;
  @attr('string') birthInseeCode;
  @attr('string') email;
  @attr('string') resultRecipientEmail;
  @attr('string') externalId;
  @attr('number') extraTimePercentage;
  @attr('boolean') isLinked;
  @attr('string') schoolingRegistrationId;
  @attr('string') sex;
  @attr('string') billingMode;
  @attr('string') prepaymentCode;
  @attr complementaryCertifications;

  get sexLabel() {
    if (this.sex === 'M') {
      return 'Homme';
    }
    if (this.sex === 'F') {
      return 'Femme';
    }
    return null;
  }

  get complementaryCertificationsList() {
    return this.complementaryCertifications.map(({ name }) => name).join(', ');
  }
}
