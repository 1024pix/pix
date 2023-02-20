import ResultCompetenceTree from '../../../../lib/domain/models/ResultCompetenceTree';
import buildCompetenceTree from './build-competence-tree';
import buildCompetenceMark from './build-competence-mark';

export default function buildResultCompetenceTree({
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
}
