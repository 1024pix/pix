export const PIX_APP_USER_DATA = {
  id: 1_000_001,
  firstName: 'PixApp',
  lastName: 'User',
  email: 'pix-app_user@example.net',
  rawPassword: 'pix123',
};

export const PIX_ORGA_ADMIN_DATA = {
  id: 1_000_002,
  firstName: 'Adi',
  lastName: 'Minh',
  email: 'admin-orga@example.net',
  rawPassword: 'pix123',
  role: 'ADMIN',
  organizations: [
    {
      type: 'PRO',
      isManagingStudents: false,
      externalId: 'PRO',
    },
    { type: 'SCO', isManagingStudents: true, identityProviderForCampaigns: 'GAR', externalId: 'SCO_MANAGING' },
    {
      type: 'SUP',
      isManagingStudents: true,
      externalId: 'SUP_MANAGING',
    },
  ],
};

export const PIX_ORGA_MEMBER_DATA = {
  id: 1_000_003,
  firstName: 'Justin',
  lastName: 'Memberr',
  email: 'pix-orga_member@example.net',
  role: 'MEMBER',
  rawPassword: 'pix123',
  organizations: [
    {
      type: 'PRO',
      isManagingStudents: false,
      externalId: 'PRO',
    },
    { type: 'SCO', isManagingStudents: true, identityProviderForCampaigns: 'GAR', externalId: 'SCO_MANAGING' },
    {
      type: 'SUP',
      isManagingStudents: true,
      externalId: 'SUP_MANAGING',
    },
  ],
};

export const CERTIFICATIONS_DATA = {
  CLEA: 'CLEA',
  EDU_1ER_DEGRE: 'EDU_1ER_DEGRE',
  DROIT: 'DROIT',
  PRO_SANTE: 'PRO_SANTE',
};

export const PIX_ADMIN_SUPPORT_DATA = {
  id: 1_000_008,
  firstName: 'PixAdmin',
  lastName: 'RoleSupport',
  email: 'pix-admin_rolesupport@example.net',
  rawPassword: 'pix123',
  role: 'SUPPORT',
};

export const PIX_CERTIF_PRO_DATA = {
  id: 1_000_005,
  firstName: 'PixCertif',
  lastName: 'CentrePRO',
  email: 'pix-certif_pro@example.net',
  rawPassword: 'pix123',
  certificationCenters: [
    {
      type: 'PRO',
      externalId: 'CERTIFPRO',
      habilitations: [
        CERTIFICATIONS_DATA.CLEA,
        CERTIFICATIONS_DATA.EDU_1ER_DEGRE,
        CERTIFICATIONS_DATA.DROIT,
        CERTIFICATIONS_DATA.PRO_SANTE,
      ],
      withOrganization: {
        isManagingStudents: false,
      },
    },
  ],
};

export const PIX_CERTIF_SCO_DATA = {
  id: 1_000_006,
  firstName: 'PixCertif',
  lastName: 'CentreSCO',
  email: 'pix-certif_sco@example.net',
  rawPassword: 'pix123',
  certificationCenters: [
    {
      type: 'SCO',
      externalId: 'CERTIFSCO',
      habilitations: [],
      withOrganization: {
        isManagingStudents: true,
      },
    },
  ],
};
