import { Certificate } from '../response-objects/Certificate.js';
import { CertificationsResults } from '../response-objects/CertificationsResults.js';
import { CompetenceResults } from '../response-objects/CompetenceResults.js';
import { buildArea as buildAreaForLivretScolaire } from './build-area-for-livret-scolaire.js';
import { buildCompetenceForLivretScolaire } from './build-competences-for-livret-scolaire.js';

function buildReferentialOfCompetences() {
  const area1 = buildAreaForLivretScolaire({
    id: '1',
    name: '1. Information et données',
  });

  const area2 = buildAreaForLivretScolaire({
    id: '2',
    name: '2. Communication et collaboration',
  });

  return [
    buildCompetenceForLivretScolaire({
      name: 'Mener une recherche et une veille d’information',
      id: '1.1',
      area: area1,
    }),
    buildCompetenceForLivretScolaire({
      name: 'Mener une recherche et une veille d’information',
      id: '1.2',
      area: area1,
    }),
    buildCompetenceForLivretScolaire({
      name: 'Mener une recherche et une veille d’information',
      id: '1.3',
      area: area1,
    }),
    buildCompetenceForLivretScolaire({
      name: 'Interagir avec des individus et de petits groupes',
      id: '2.1',
      area: area2,
    }),
    buildCompetenceForLivretScolaire({
      name: 'Partager et publier des informations et des contenus',
      id: '2.2',
      area: area2,
    }),
    buildCompetenceForLivretScolaire({
      name: 'Collaborer dans un groupe pour réaliser un projet',
      id: '2.3',
      area: area2,
    }),
  ];
}

function _buildCompetenceResult(level = 5, competenceId) {
  return new CompetenceResults({ level, competenceId });
}

function _buildCompetenceResults() {
  const competenceResults = buildReferentialOfCompetences();
  return competenceResults.map((competence) => _buildCompetenceResult(4, competence.id));
}

function buildCertificateForLivretScolaire({
  id = 1,
  firstName = 'Jean',
  middleName = 'Jerry',
  thirdName = 'Bobby',
  lastName = 'Bon',
  birthdate = '1992-06-12',
  nationalStudentId = 'nationalStudentId1',
  status = 'started',
  pixScore = 320,
  verificationCode = 'P-BBBCCCDD',
  date = '2018-12-01T01:02:03Z',
  deliveredAt = '2018-10-03T01:02:03Z',
  certificationCenter = 'ToonsVille',
  competenceResults = _buildCompetenceResults(),
} = {}) {
  const certificate = new Certificate({
    id,
    firstName,
    middleName,
    thirdName,
    lastName,
    birthdate,
    nationalStudentId,
    status,
    pixScore,
    verificationCode,
    date,
    deliveredAt,
    competenceResults,
    certificationCenter,
  });

  return certificate;
}

function buildCertificationsResults(certifications, competences = buildReferentialOfCompetences()) {
  return new CertificationsResults({ certifications, competences });
}

export { buildCertificateForLivretScolaire, buildCertificationsResults, buildReferentialOfCompetences };
