const ResultCompetenceTree = require('../../../../lib/domain/models/ResultCompetenceTree');
const buildCompetenceTree = require('./build-competence-tree');
const buildCompetenceMark = require('./build-competence-mark');

module.exports = function buildResultCompetenceTree({
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
