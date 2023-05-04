import { ResultCompetenceTree } from '../../../../lib/domain/models/ResultCompetenceTree.js';
import { buildCompetenceTree } from './build-competence-tree.js';
import { buildCompetenceMark } from './build-competence-mark.js';

const buildResultCompetenceTree = function ({
  id = '1-1',
  competenceTree = buildCompetenceTree(),
  competenceMarks = [buildCompetenceMark()],
} = {}) {
  const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
    competenceTree,
    competenceMarks,
  });
  resultCompetenceTree.id = id;
  return resultCompetenceTree;
};

export { buildResultCompetenceTree };
