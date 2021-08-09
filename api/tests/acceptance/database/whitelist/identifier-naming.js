const nonLegitimateUsages = [{ identifier: 'public.finalized-sessions', rule: 'identifier-naming' }];
const legitimateUsages = [];
const exceptions = [...nonLegitimateUsages, ...legitimateUsages];

module.exports = exceptions;
