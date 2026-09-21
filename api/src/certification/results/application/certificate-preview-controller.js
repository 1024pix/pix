import { Area } from '../../../shared/domain/models/Area.js';
import { getI18n } from '../../../shared/infrastructure/i18n/i18n.js';
import { Frameworks } from '../../shared/domain/models/Frameworks.js';
import { findIntervalIndexFromScore } from '../../shared/domain/services/mesh-service.js';
import { ResultCompetence } from '../domain/models/ResultCompetence.js';
import { ResultCompetenceTree } from '../domain/models/ResultCompetenceTree.js';
import { Certificate } from '../domain/models/v3/Certificate.js';
import * as v3CertificationAttestationPdf from '../infrastructure/utils/pdf/generate-v3-pdf-certificate.js';

const AREAS = [
  {
    code: '1',
    title: 'Informations et données',
    color: '#F24645',
    competences: [
      { code: '1.1', name: "Mener une recherche et une veille d'information" },
      { code: '1.2', name: 'Gérer des données' },
      { code: '1.3', name: 'Traiter des données' },
    ],
  },
  {
    code: '2',
    title: 'Communication et collaboration',
    color: '#1A8C89',
    competences: [
      { code: '2.1', name: 'Interagir' },
      { code: '2.2', name: 'Partager et publier' },
      { code: '2.3', name: 'Collaborer' },
      { code: '2.4', name: "S'insérer dans le monde numérique" },
    ],
  },
  {
    code: '3',
    title: 'Création de contenu',
    color: '#3D68FF',
    competences: [
      { code: '3.1', name: 'Développer des documents textuels' },
      { code: '3.2', name: 'Développer des documents multimédia' },
      { code: '3.3', name: 'Adapter les documents à leur finalité' },
      { code: '3.4', name: 'Programmer' },
    ],
  },
  {
    code: '4',
    title: 'Protection et sécurité',
    color: '#AC008D',
    competences: [
      { code: '4.1', name: "Sécuriser l'environnement numérique" },
      { code: '4.2', name: 'Protéger les données personnelles et la vie privée' },
      { code: '4.3', name: 'Se protéger des risques' },
    ],
  },
  {
    code: '5',
    title: 'Environnement numérique',
    color: '#5E2563',
    competences: [
      { code: '5.1', name: 'Résoudre des problèmes techniques' },
      { code: '5.2', name: 'Construire un environnement numérique' },
    ],
  },
];

async function generateCertificatePreview(request, h) {
  const { locale, pixScore, competences } = request.payload;
  const reachedMeshIndex = findIntervalIndexFromScore({ score: pixScore, maxReachableLevel: 8 });
  const i18n = getI18n(locale ?? 'fr');

  const areas = AREAS.map((areaConfig) => {
    const area = new Area({
      id: areaConfig.code,
      code: areaConfig.code,
      title: areaConfig.title,
      color: areaConfig.color,
      competences: [],
    });
    area.resultCompetences = areaConfig.competences.map((comp) => {
      const found = competences?.find((c) => c.code === comp.code);
      return new ResultCompetence({
        id: `competence-${comp.code}`,
        index: comp.code,
        level: found?.level ?? 0,
        name: comp.name,
        score: 0,
      });
    });
    return area;
  });

  const resultCompetenceTree = new ResultCompetenceTree({ id: 'preview', areas });

  const certificate = new Certificate({
    id: 999999,
    firstName: 'Candidat',
    lastName: 'PRÉVISUALISATION',
    birthdate: new Date('1990-01-01'),
    birthplace: 'Paris',
    certificationCenter: 'Centre de certification (prévisualisation)',
    deliveredAt: new Date(),
    pixScore,
    reachedMeshIndex,
    verificationCode: 'PREVW-12345',
    resultCompetenceTree,
    algorithmEngineVersion: 'V3',
    certificationDate: new Date(),
    certificationFramework: Frameworks.CORE,
    acquiredComplementaryCertification: null,
    eduV3ExternalJuryResult: null,
  });

  const pdf = await v3CertificationAttestationPdf.generate({ certificates: [certificate], i18n, testing: true });

  return h
    .response(pdf)
    .code(200)
    .header('Content-Disposition', 'attachment; filename=certificate-preview.pdf')
    .header('Content-Type', 'application/pdf');
}

export const certificatePreviewController = { generateCertificatePreview };
