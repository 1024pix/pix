export class ActiveCredits {
  #lots;

  constructor(creditsLots = []) {
    this.#lots = creditsLots
      .filter((lot) => lot.isActive)
      .toSorted((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate) || a.id - b.id);

    const lotWithoutConsumedCount = this.#lots.find((lot) => lot.consumedCount === undefined);
    if (lotWithoutConsumedCount) {
      throw new Error(`Le lot ${lotWithoutConsumedCount.id} a été chargé sans son nombre de crédits consommés.`);
    }
  }

  get lotIds() {
    return this.#lots.map((lot) => lot.id);
  }

  get lotToCharge() {
    return this.#lots.find((lot) => lot.hasRemainingCapacity) ?? null;
  }
}
