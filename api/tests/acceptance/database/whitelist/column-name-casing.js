const legitimateUsages = [
  { identifier: 'public.certification-cpf-cities.INSEECode', rule: 'column-name-casing' },
  { identifier: 'public.schooling-registrations.MEFCode', rule: 'column-name-casing' },
];

const uncheckedUsages = [
  { identifier: 'public.competence-marks.area_code', rule: 'column-name-casing' },
  { identifier: 'public.users_pix_roles.user_id', rule: 'column-name-casing' },
  { identifier: 'public.users_pix_roles.pix_role_id', rule: 'column-name-casing' },
  { identifier: 'public.competence-marks.competence_code', rule: 'column-name-casing' },
];

const exceptions = [...legitimateUsages, ...uncheckedUsages];

module.exports = exceptions;
