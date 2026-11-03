import { anonymizeGeneralizeDate } from '../../../shared/infrastructure/utils/date-utils.ts';

export class LastUserApplicationConnection {
  constructor({ id, userId, application, lastLoggedAt }) {
    this.id = id;
    this.userId = userId;
    this.application = application;
    this.lastLoggedAt = lastLoggedAt;
  }

  anonymize() {
    const generalizedLastLoggedAt = anonymizeGeneralizeDate(this.lastLoggedAt);

    return new LastUserApplicationConnection({
      id: this.id,
      userId: this.userId,
      application: this.application,
      lastLoggedAt: generalizedLastLoggedAt,
    });
  }
}
