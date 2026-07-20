import Model, { attr, hasMany } from '@ember-data/model';

export default class CertificationTargetProfileSummary extends Model {
  @attr('string') name;

  @hasMany('certification-badge-summary', { async: false, inverse: null }) badgeSummaries;

  get attachedAt() {
    const dates = this.badgeSummaries.map((badge) => badge.createdAt).filter(Boolean);

    return dates.length ? new Date(Math.max(...dates.map((date) => date.getTime()))) : null;
  }

  get detachedAt() {
    const dates = this.badgeSummaries.map((badge) => badge.detachedAt).filter(Boolean);

    return dates.length ? new Date(Math.max(...dates.map((date) => date.getTime()))) : null;
  }
}
