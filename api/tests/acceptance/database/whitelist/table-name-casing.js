const legitimateUsages = [{ identifier: 'public.target-profiles_skills', rule: 'table-name-casing' }];

const nonLegitimateUsages = [
  { identifier: 'public.users_pix_roles', rule: 'table-name-casing' },
  { identifier: 'public.pix_roles', rule: 'table-name-casing' },
  { identifier: 'public.user_tutorials', rule: 'table-name-casing' },
];

const exceptions = [...legitimateUsages, ...nonLegitimateUsages];

module.exports = exceptions;
