import { CERTIFICATIONS_DATA } from '../../../helpers/db-data.ts';

export const allTestData = [
  {
    certification: CERTIFICATIONS_DATA.CLEA,
    tag: '@clea',
    adminCertificationListInfo: {
      takenCertification: 'PIX / CléA Numérique',
    },
    appCertificationListInfo: {
      mainStatus: 'Certification Pix : Non obtenue',
      extraStatus: 'CLéA Numérique : Non obtenue',
      comment:
        "Commentaire : Les résultats obtenus ne permettent pas encore la délivrance de la certification Pix. Vous avez besoin de progresser pour être plus à l'aise avec votre environnement numérique et pouvoir valoriser vos compétences.",
    },
  },
  {
    certification: CERTIFICATIONS_DATA.CORE,
    tag: '@core',
    adminCertificationListInfo: {
      takenCertification: 'Pix Cœur',
    },
    appCertificationListInfo: {
      mainStatus: 'Certification Pix : Non obtenue',
      extraStatus: null,
      comment:
        "Commentaire : Les résultats obtenus ne permettent pas encore la délivrance de la certification Pix. Vous avez besoin de progresser pour être plus à l'aise avec votre environnement numérique et pouvoir valoriser vos compétences.",
    },
  },
  {
    certification: CERTIFICATIONS_DATA.EDU_1ER_DEGRE,
    tag: '@edu',
    adminCertificationListInfo: {
      takenCertification: 'Pix+ Édu 1er degré',
    },
    appCertificationListInfo: {
      mainStatus: 'Pix+ Édu 1er degré : Non admissible',
      extraStatus: null,
      comment:
        "Commentaire : Les résultats obtenus ne permettent pas l'admissibilité au volet 2 de pratique professionnelle de la certification Pix+ Édu. Vous avez besoin de consolider vos acquis (en matière de numérique éducatif) pour valoriser vos compétences professionnelles.",
    },
  },
  {
    certification: CERTIFICATIONS_DATA.DROIT,
    tag: '@droit',
    adminCertificationListInfo: {
      takenCertification: 'Pix+ Droit',
    },
    appCertificationListInfo: {
      mainStatus: 'Pix+ Droit : Non obtenue',
      extraStatus: null,
      comment:
        'Commentaire : Les résultats obtenus ne permettent pas la validation de votre certification. Vous avez besoin de consolider vos acquis pour valoriser ces compétences.',
    },
  },
  {
    certification: CERTIFICATIONS_DATA.PRO_SANTE,
    tag: '@prosante',
    adminCertificationListInfo: {
      takenCertification: 'Pix+ Pro Santé',
    },
    appCertificationListInfo: {
      mainStatus: 'Pix+ Professionnels de Santé : Non obtenue',
      extraStatus: null,
      comment:
        'Commentaire : Les résultats obtenus ne permettent pas la validation de votre certification. Vous avez besoin de consolider vos acquis pour valoriser ces compétences.',
    },
  },
];
