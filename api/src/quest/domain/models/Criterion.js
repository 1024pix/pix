export class Criterion {
  #data;

  constructor({ data }) {
    this.#data = data;
  }

  get data() {
    return Object.freeze(this.#data);
  }

  toDTO() {
    return this.#data;
  }

  check({ item, comparisonFunction }) {
    return Object.keys(this.#data)[comparisonFunction]((key) => {
      // TODO: Dés que les quêtes ont été mises à jour il faudra retirer cette ligne
      const alterKey = key === 'targetProfileIds' ? 'targetProfileId' : key;
      return this.#checkCriterionAttribute({
        criterionAttr: this.#data[key],
        dataAttr: item[alterKey],
      });
    });
  }

  #checkCriterionAttribute({ criterionAttr, dataAttr }) {
    if (Array.isArray(criterionAttr)) {
      if (Array.isArray(dataAttr)) {
        return criterionAttr.every((valueToTest) => dataAttr.includes(valueToTest));
      }
      return criterionAttr.some((valueToTest) => valueToTest === dataAttr);
    }
    return dataAttr === criterionAttr;
  }
}
