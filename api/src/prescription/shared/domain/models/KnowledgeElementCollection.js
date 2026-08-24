import { KnowledgeElement } from '../../../../shared/domain/models/KnowledgeElement.js';

// bounded-context: should be transformed to a KnowledgeElementSnapshot model with a factory fromCollection(KEs)
class KnowledgeElementCollection {
  constructor(knowledgeElements = []) {
    this.knowledgeElements = knowledgeElements;
  }

  toSnapshot() {
    return JSON.stringify(
      KnowledgeElement.toLatestUniqNonResetCollection(this.knowledgeElements).map(
        ({ createdAt, source, status, earnedPix, skillId, competenceId }) => {
          return { createdAt, source, status, earnedPix, skillId, competenceId };
        },
      ),
    );
  }
}

export { KnowledgeElementCollection };
