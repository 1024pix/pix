import { STRUCTURE_CATEGORY_PRO_ID } from './constants.js';

export function buildCertificationCenterWithStructure(databaseBuilder) {
  databaseBuilder.factory.buildCertificationCenterWithStructure({
    certificationCenterData: {
      name: "CDC avec structure propre (catégorie PRO) - à rattacher au Collège 1 de l'Académie de Nantes",
      type: 'SCO',
      createdAt: new Date('2026-09-25'),
    },
    categoryId: STRUCTURE_CATEGORY_PRO_ID,
  });
}
