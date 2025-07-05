function* incrementId(start: number) {
  let current = start;
  while (true) {
    yield current;
    current += 1;
  }
}

export const iterDBId = incrementId(200_000);

export const PIX_APP_USER_DATA = {
  id: iterDBId.next().value as number,
  firstName: 'PixApp',
  lastName: 'User',
  email: 'pix-app_user@example.net',
  rawPassword: 'pix123',
};

export const PIX_ORGA_PRO_DATA = {
  id: iterDBId.next().value as number,
  firstName: 'PixOrga',
  lastName: 'ProPrescripteur',
  email: 'pix-orga_pro-prescripteur@example.net',
  rawPassword: 'pix123',
  organization: {
    id: iterDBId.next().value as number,
    type: 'PRO',
    isManagingStudents: false,
    externalId: 'ORGAPRO',
  },
};

export const PIX_ORGA_SCO_ISMANAGING_DATA = {
  id: iterDBId.next().value as number,
  firstName: 'PixOrga',
  lastName: 'ScoIsManagingPrescripteur',
  email: 'pix-orga_sco-is-managing-prescripteur@example.net',
  rawPassword: 'pix123',
  organization: {
    id: iterDBId.next().value as number,
    type: 'SCO',
    isManagingStudents: true,
    identityProviderForCampaigns: 'GAR',
    externalId: 'ORGASCOISMANAGING',
  },
};

export const RANDOM_SEED = 0.123;
