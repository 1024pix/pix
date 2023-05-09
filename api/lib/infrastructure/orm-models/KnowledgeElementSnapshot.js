import { Bookshelf } from '../bookshelf.js';

const modelName = 'KnowledgeElementSnapshot';

const BookshelfKnowledgeElementSnapshot = Bookshelf.model(
  modelName,
  {
    tableName: 'knowledge-element-snapshots',
  },
  {
    modelName,
  }
);

export { BookshelfKnowledgeElementSnapshot };
