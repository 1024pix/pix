const nonLegitimateUsages = [{ identifierPattern: 'public\\.partner-certifications.*', rule: 'foreign-key-to-id' }];

const foreignKeysToId = [...nonLegitimateUsages];

module.exports = foreignKeysToId;
