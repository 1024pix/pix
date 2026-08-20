import { TubeResultForKnowledgeStates } from './TubeResultForKnowledgeStates.js';

class CompetenceResultForKnowledgeStates {
  #tubeResults;

  id;
  index;
  name;
  description;
  meanLevel = 0;
  maxLevel = 0;

  constructor({ competence } = {}) {
    this.#tubeResults = competence.tubes.map((tube) => new TubeResultForKnowledgeStates({ tube, competence }));

    this.id = competence.id;
    this.index = competence.index;
    this.name = competence.name;
    this.description = competence.description;
  }

  /** @param {KnowledgeState[]} knowledgeStates un état par participation */
  addKnowledgeStates(knowledgeStates) {
    this.#tubeResults.forEach((tubesWithLevel) => tubesWithLevel.addKnowledgeStates(knowledgeStates));
    this.maxLevel = averageBy(this.#tubeResults, 'maxLevel');
    this.meanLevel = averageBy(this.#tubeResults, 'meanLevel');
  }
}

const averageBy = (collection, propName) => {
  if (!propName) {
    return collection.reduce((acc, value) => value + acc, 0) / collection.length;
  }
  return collection.reduce((acc, item) => acc + item[propName], 0) / collection.length;
};

export { CompetenceResultForKnowledgeStates };
