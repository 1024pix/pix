import { dayBounds } from '../../../../shared/infrastructure/utils/date-utils.ts';
import { validate } from '../validators/credits-lot-validator.js';

const CREDITS_LOT_TIMEZONE = 'Europe/Paris';

export class CreditsLotToCreate {
  constructor({ structureId, count, activationDate, expirationDate, reference, createdBy }) {
    validate({ structureId, count, activationDate, expirationDate, reference, createdBy });

    this.structureId = structureId;
    this.count = count;
    this.activationDate = dayBounds(activationDate, CREDITS_LOT_TIMEZONE).start;
    this.expirationDate = new Date(dayBounds(expirationDate, CREDITS_LOT_TIMEZONE).end.getTime() - 1);
    this.reference = reference.trim();
    this.createdBy = createdBy;
  }
}
