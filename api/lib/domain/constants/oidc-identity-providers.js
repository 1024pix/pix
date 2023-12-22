const POLE_EMPLOI = {
  code: 'POLE_EMPLOI',
  configKey: 'poleEmploi',
};
const CNAV = {
  code: 'CNAV',
  configKey: 'cnav',
};
const FWB = {
  code: 'FWB',
  configKey: 'fwb',
};
const GOOGLE = {
  code: 'GOOGLE',
  configKey: 'google',
};
const PAYSDELALOIRE = {
  code: 'PAYSDELALOIRE',
  configKey: 'paysdelaloire',
};

function getValidOidcProviderCodes() {
  return [POLE_EMPLOI.code, CNAV.code, FWB.code, GOOGLE.code, PAYSDELALOIRE.code];
}

export { getValidOidcProviderCodes, POLE_EMPLOI, CNAV, FWB, GOOGLE, PAYSDELALOIRE };
