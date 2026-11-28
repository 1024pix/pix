import dayjs from 'dayjs';

export class CreditsLot {
  /**
   * @param {Object} params
   * @param {number} params.id
   * @param {number} params.structureId
   * @param {number} params.count
   * @param {Date} params.activationDate
   * @param {Date} params.expirationDate
   * @param {string} params.reference
   * @param {string} params.creatorFirstName
   * @param {string} params.creatorLastName
   */
  #statusList;
  constructor({
    id,
    structureId,
    count,
    activationDate,
    expirationDate,
    reference,
    creatorFirstName,
    creatorLastName,
  }) {
    this.id = id;
    this.structureId = structureId;
    this.count = count;
    this.activationDate = activationDate;
    this.expirationDate = expirationDate;
    this.reference = reference;
    this.creatorFullName = `${creatorFirstName} ${creatorLastName}`;

    this.#statusList = {
      active: 'ACTIVE',
      pending: 'PENDING',
      expired: 'EXPIRED',
    };
  }

  get status() {
    const now = new Date();
    if (dayjs(this.expirationDate).isBefore(dayjs(now))) {
      return this.#statusList.expired;
    }
    if (dayjs(this.activationDate).isAfter(dayjs(now))) {
      return this.#statusList.pending;
    }
    return this.#statusList.active;
  }
}
