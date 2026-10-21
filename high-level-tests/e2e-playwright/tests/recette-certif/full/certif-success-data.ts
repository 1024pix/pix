import { CERTIFICATIONS_DATA } from '../../../helpers/db-data.ts';

export const allTestData = [
  {
    certification: CERTIFICATIONS_DATA.CLEA,
    tag: '@clea',
    adminCertificationListInfo: {
      takenCertification: 'PIX / CléA Numérique',
    },
    appCertificationListInfo: {
      mainStatus: 'Certification Pix : Obtenue',
      extraStatus: 'CLéA Numérique : Obtenue',
    },
  },
  {
    certification: CERTIFICATIONS_DATA.CORE,
    tag: '@core',
    adminCertificationListInfo: {
      takenCertification: 'Pix Cœur',
    },
    appCertificationListInfo: {
      mainStatus: 'Certification Pix : Obtenue',
      extraStatus: null,
    },
  },
  {
    certification: CERTIFICATIONS_DATA.EDU_1ER_DEGRE,
    tag: '@edu',
    adminCertificationListInfo: {
      takenCertification: 'Pix+ Édu 1er degré',
    },
    appCertificationListInfo: {
      mainStatus: 'Pix+ Édu 1er degré : Admissible',
      extraStatus: null,
    },
  },
  {
    certification: CERTIFICATIONS_DATA.DROIT,
    tag: '@droit',
    adminCertificationListInfo: {
      takenCertification: 'Pix+ Droit',
    },
    appCertificationListInfo: {
      mainStatus: 'Pix+ Droit : Expert',
      extraStatus: null,
    },
  },
  {
    certification: CERTIFICATIONS_DATA.PRO_SANTE,
    tag: '@prosante',
    adminCertificationListInfo: {
      takenCertification: 'Pix+ Pro Santé',
    },
    appCertificationListInfo: {
      mainStatus: 'Pix+ Professionnels de Santé : Expert',
      extraStatus: null,
    },
  },
];
