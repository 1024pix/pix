import Bookshelf from '../bookshelf';

const modelName = 'KnowledgeElementSnapshot';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'knowledge-element-snapshots',
  },
  {
    modelName,
  }
);
