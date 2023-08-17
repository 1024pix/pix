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

function getValidOidcProviderCodes() {
  return [POLE_EMPLOI.code, CNAV.code, FWB.code];
}

export { CNAV, FWB, getValidOidcProviderCodes, POLE_EMPLOI };
