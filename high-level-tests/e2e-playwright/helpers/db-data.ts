function* incrementId(start: number) {
  let current = start;
  while (true) {
    yield current;
    current += 1;
  }
}

export const iterDBId = incrementId(100_000);

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
  organizationId: iterDBId.next().value as number,
  type: 'PRO',
};

export const RANDOM_SEED = 0.123;
