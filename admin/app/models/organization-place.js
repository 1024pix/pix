import Model, { attr } from '@ember-data/model';

const statuses = {
  ACTIVE: 'Actif',
  EXPIRED: 'Expiré',
  PENDING: 'À venir',
};

const categories = {
  FREE_RATE: 'Tarif gratuit',
  PUBLIC_RATE: 'Tarif public',
  REDUCE_RATE: 'Tarif réduit',
  SPECIAL_REDUCE_RATE: 'Tarif réduit spécial',
  FULL_RATE: 'Tarif plein',
};
export default class OrganizationPlace extends Model {
  @attr('number') count;
  @attr('string') reference;
  @attr('string') category;
  @attr('string') status;
  @attr('date') activationDate;
  @attr('date') expiredDate;
  @attr('date') createdAt;
  @attr('string') creatorFullName;

  get displayStatus() {
    return statuses[this.status];
  }

  get categoryLabel() {
    return categories[this.category];
  }

  get hasExpiredDate() {
    return Boolean(this.expiredDate);
  }
}
