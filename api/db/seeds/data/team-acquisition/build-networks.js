import { buildCreditsLot } from '../../../database-builder/factory/build-credits-lot.js';
import { buildOrganizationFeature } from '../../../database-builder/factory/build-organization-feature.js';
import {
  FEATURE_CREDITS_MANAGEMENT_ID,
  STRUCTURE_CATEGORY_SCO_ID,
  USER_ID_ADMIN_ORGANIZATION,
} from '../common/constants.js';
import {
  ADMINISTRATION_TEAM_ALPHA_ID,
  ADMINISTRATION_TEAM_SOLO_ID,
  ORGANIZATION_LEARNER_TYPE_PROFESSIONAL_ID,
  ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
} from './constants.js';

function _buildProNetwork(databaseBuilder) {
  const {
    network,
    organization,
    structure: headStructure,
  } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
    name: 'Réseau Professionnel',
    headOrganization: {
      name: 'ABC Comptabilité',
      externalId: 'PRO_FOR_NETWORK',
      type: 'PRO',
      provinceCode: '75',
      createdAt: new Date('2026-09-03'),
      updatedAt: new Date('2026-09-03'),

      administrationTeamId: ADMINISTRATION_TEAM_SOLO_ID,
      organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_PROFESSIONAL_ID,
    },
  });
  buildOrganizationFeature({
    organizationId: organization.id,
    featureId: FEATURE_CREDITS_MANAGEMENT_ID,
  });
  buildCreditsLot({
    structureId: headStructure.id,
    createdBy: USER_ID_ADMIN_ORGANIZATION,
    reference: 'REF5678',
  });
  buildCreditsLot({
    structureId: headStructure.id,
    createdBy: USER_ID_ADMIN_ORGANIZATION,
    reference: 'REF1234',
  });
  _buildRegionalAgencies();

  function _buildRegionalAgencies() {
    databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: headStructure.id,
      organizationData: {
        name: 'ABC Comptabilité Agence Ile-de-France',
        externalId: 'PRO_FOR_NETWORK',
        type: 'PRO',
        provinceCode: '75',
        createdAt: new Date('2026-09-03'),
        updatedAt: new Date('2026-09-03'),

        administrationTeamId: ADMINISTRATION_TEAM_SOLO_ID,
        organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_PROFESSIONAL_ID,
      },
    });

    databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: headStructure.id,
      organizationData: {
        name: 'ABC Comptabilité Agence Hauts de France',
        externalId: 'PRO_FOR_NETWORK',
        type: 'PRO',
        provinceCode: '59',
        createdAt: new Date('2026-09-03'),
        updatedAt: new Date('2026-09-03'),

        administrationTeamId: ADMINISTRATION_TEAM_SOLO_ID,
        organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_PROFESSIONAL_ID,
      },
    });

    databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: headStructure.id,
      organizationData: {
        name: 'ABC Comptabilité Agence Corse',
        externalId: 'PRO_FOR_NETWORK',
        type: 'PRO',
        provinceCode: '20',
        createdAt: new Date('2026-09-03'),
        updatedAt: new Date('2026-09-03'),

        administrationTeamId: ADMINISTRATION_TEAM_SOLO_ID,
        organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_PROFESSIONAL_ID,
      },
    });
  }
}

function _buildScoNetwork(databaseBuilder) {
  const { network, structure: ministereStructure } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
    name: 'Réseau Scolaire',
    headOrganization: {
      name: 'Ministère',
      externalId: 'SCO_FOR_NETWORK',
      type: 'SCO',
      provinceCode: '75',
      isManagingStudents: true,
      createdAt: new Date('2026-09-03'),
      updatedAt: new Date('2026-09-03'),

      administrationTeamId: ADMINISTRATION_TEAM_ALPHA_ID,
      organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
    },
  });

  _buildAcademieVersaillesAndChildren();
  _buildAcademieNantesAndChildren();
  _buildAcademieLilleAndChildren();

  function _buildAcademieVersaillesAndChildren() {
    const { structure: academieVersaillesStructure } = databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: ministereStructure.id,
      organizationData: {
        name: 'Académie de Versailles',
        externalId: 'SCO_FOR_NETWORK',
        type: 'SCO',
        provinceCode: '78',
        isManagingStudents: true,
        createdAt: new Date('2026-09-03'),
        updatedAt: new Date('2026-09-03'),

        administrationTeamId: ADMINISTRATION_TEAM_ALPHA_ID,
        organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
      },
    });

    const { organization: lyceeVersailles } = databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: academieVersaillesStructure.id,
      organizationData: {
        name: "Lycée 1 de l'Académie de Versailles",
        externalId: 'SCO_FOR_NETWORK',
        type: 'SCO',
        provinceCode: '78',
        isManagingStudents: true,
        createdAt: new Date('2026-09-03'),
        updatedAt: new Date('2026-09-03'),
        administrationTeamId: ADMINISTRATION_TEAM_ALPHA_ID,
        organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
      },
    });

    databaseBuilder.factory.buildCertificationCenter({
      name: "Lycée 1 de l'Académie de Versailles",
      type: 'SCO',
      createdAt: new Date('2026-09-03'),
      organizationId: lyceeVersailles.id,
    });

    const { organization: collegeVersailles } = databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: academieVersaillesStructure.id,
      organizationData: {
        name: "Collège 1 de l'Académie de Versailles",
        externalId: 'SCO_FOR_NETWORK',
        type: 'SCO',
        provinceCode: '78',
        isManagingStudents: true,
        createdAt: new Date('2026-09-03'),
        updatedAt: new Date('2026-09-03'),
        administrationTeamId: ADMINISTRATION_TEAM_ALPHA_ID,
        organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
      },
    });

    databaseBuilder.factory.buildCertificationCenter({
      name: "Collège 1 de l'Académie de Versailles",
      type: 'SCO',
      createdAt: new Date('2026-09-03'),
      organizationId: collegeVersailles.id,
    });
  }

  function _buildAcademieNantesAndChildren() {
    const { structure: academieNantesStructure } = databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: ministereStructure.id,
      organizationData: {
        name: 'Académie de Nantes',
        externalId: 'SCO_FOR_NETWORK',
        type: 'SCO',
        provinceCode: '44',
        isManagingStudents: true,
        createdAt: new Date('2026-09-03'),
        updatedAt: new Date('2026-09-03'),

        administrationTeamId: ADMINISTRATION_TEAM_ALPHA_ID,
        organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
      },
    });

    databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: academieNantesStructure.id,
      organizationData: {
        name: "Lycée 1 de l'Académie de Nantes",
        externalId: 'SCO_FOR_NETWORK',
        type: 'SCO',
        provinceCode: '44',
        isManagingStudents: true,
        createdAt: new Date('2026-09-03'),
        updatedAt: new Date('2026-09-03'),

        administrationTeamId: ADMINISTRATION_TEAM_ALPHA_ID,
        organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
      },
    });

    databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: academieNantesStructure.id,
      categoryId: STRUCTURE_CATEGORY_SCO_ID,
      organizationData: {
        name: "Collège 1 de l'Académie de Nantes",
        externalId: 'SCO_FOR_NETWORK',
        type: 'SCO',
        provinceCode: '44',
        isManagingStudents: true,
        createdAt: new Date('2026-09-03'),
        updatedAt: new Date('2026-09-03'),

        administrationTeamId: ADMINISTRATION_TEAM_ALPHA_ID,
        organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
      },
    });
  }

  function _buildAcademieLilleAndChildren() {
    const { structure: academieLilleStructure } = databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: ministereStructure.id,
      organizationData: {
        name: 'Académie de Lille',
        externalId: 'SCO_FOR_NETWORK',
        type: 'SCO',
        provinceCode: '59',
        isManagingStudents: true,
        createdAt: new Date('2026-09-03'),
        updatedAt: new Date('2026-09-03'),

        administrationTeamId: ADMINISTRATION_TEAM_ALPHA_ID,
        organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
      },
    });

    databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: academieLilleStructure.id,
      organizationData: {
        name: "Lycée 1 de l'Académie de Lille",
        externalId: 'SCO_FOR_NETWORK',
        type: 'SCO',
        provinceCode: '59',
        isManagingStudents: true,
        createdAt: new Date('2026-09-03'),
        updatedAt: new Date('2026-09-03'),

        administrationTeamId: ADMINISTRATION_TEAM_ALPHA_ID,
        organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
      },
    });

    databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: academieLilleStructure.id,
      organizationData: {
        name: "Collège 1 de l'Académie de Lille",
        externalId: 'SCO_FOR_NETWORK',
        type: 'SCO',
        provinceCode: '59',
        isManagingStudents: true,
        createdAt: new Date('2026-09-03'),
        updatedAt: new Date('2026-09-03'),

        administrationTeamId: ADMINISTRATION_TEAM_ALPHA_ID,
        organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_STUDENT_ID,
      },
    });
  }
}

function _buildComplexNetwork(databaseBuilder) {
  databaseBuilder.factory.buildNetworkWithMultipleLevels({
    name: 'Réseau Complexe',
    numberOfLevels: 4,
    childrenPerNode: 3,
  });
}

function _buildExtraNetworksForPagination(databaseBuilder) {
  databaseBuilder.factory.buildNetworkAndHeadOrganization({ name: 'Réseau Auvergne-Rhône-Alpes' });
  databaseBuilder.factory.buildNetworkAndHeadOrganization({ name: 'Réseau Bourgogne-Franche-Comté' });
  databaseBuilder.factory.buildNetworkAndHeadOrganization({ name: 'Réseau Bretagne' });
  databaseBuilder.factory.buildNetworkAndHeadOrganization({ name: 'Réseau Centre-Val de Loire' });
  databaseBuilder.factory.buildNetworkAndHeadOrganization({ name: 'Réseau Grand Est' });
  databaseBuilder.factory.buildNetworkAndHeadOrganization({ name: 'Réseau Normandie' });
  databaseBuilder.factory.buildNetworkAndHeadOrganization({ name: 'Réseau Nouvelle-Aquitaine' });
  databaseBuilder.factory.buildNetworkAndHeadOrganization({ name: 'Réseau Occitanie' });
  databaseBuilder.factory.buildNetworkAndHeadOrganization({ name: 'Réseau Pays de la Loire' });
}

export function buildNetworks(databaseBuilder) {
  _buildProNetwork(databaseBuilder);
  _buildScoNetwork(databaseBuilder);
  _buildComplexNetwork(databaseBuilder);
  _buildExtraNetworksForPagination(databaseBuilder);
}
