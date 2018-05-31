const CertifiedProfile = require('../../lib/domain/models/CertifiedProfile');
const buildCompetenceMark = require('./build-competence-mark');

const competenceMark = buildCompetenceMark({ competence_code: '2.1', level: 2 });

const listOfCompetence = [
  {
    name: 'Sécuriser',
    index: '4.1',
    area: {
      code: '4',
      title: 'Protection',
    },
  },
  {
    name: 'Interagir',
    index: '2.1',
    area: {
      code: '2',
      title: 'Communiquer et collaborer',
    },
  },
];

module.exports = function buildCertifiedProfile(
  {
    id = 0,
    allCompetences = listOfCompetence,
    competencesEvaluated = [competenceMark],
  } = {}) {
  return new CertifiedProfile({ id, allCompetences, competencesEvaluated });
};
