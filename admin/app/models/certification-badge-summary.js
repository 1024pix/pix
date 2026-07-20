import Model, { attr } from '@ember-data/model';

export default class CertificationBadgeSummary extends Model {
  @attr('string') label;
  @attr('number') level;
  @attr('string') imageUrl;
  @attr('number') minimumEarnedPix;
  @attr('date') createdAt;
  @attr('date') detachedAt;
}
