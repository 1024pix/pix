import dayjs from 'dayjs';

export const STATUSES = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  EXPIRED: 'EXPIRED',
};

export class OrganizationCreditsLot {
  /**
   * @param {Object} params
   * @param {number} params.id
   * @param {number} params.count
   * @param {Date} params.activationDate
   * @param {Date} params.expirationDate
   * @param {string} params.reference
   * @param {Array<{organizationLearnerId: number, firstName: string, lastName: string, consumedAt: Date}>} params.consumptions
   */
  constructor({ id, count, activationDate, expirationDate, reference, consumptions = [] }) {
    this.id = id;
    this.count = count;
    this.activationDate = activationDate;
    this.expirationDate = expirationDate;
    this.reference = reference;
    this.consumptions = consumptions.map(({ organizationLearnerId, firstName, lastName, consumedAt }) => ({
      organizationLearnerId,
      firstName,
      lastName,
      consumedAt,
    }));
  }

  get consumedCount() {
    return this.consumptions.length;
  }

  get availableCount() {
    return Math.max(this.count - this.consumedCount, 0);
  }

  get status() {
    const now = dayjs();
    if (dayjs(this.expirationDate).isBefore(now)) return STATUSES.EXPIRED;
    if (dayjs(this.activationDate).isAfter(now)) return STATUSES.PENDING;
    return STATUSES.ACTIVE;
  }
}
