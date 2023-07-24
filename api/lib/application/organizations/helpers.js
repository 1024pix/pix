const certificabilityByLabel = {
  'not-available': null,
  eligible: true,
  'non-eligible': false,
};

function mapCertificabilityByLabel(certificabilityFilter) {
  let result = certificabilityFilter;
  if (!Array.isArray(certificabilityFilter)) {
    result = [certificabilityFilter];
  }
  return result.map((value) => certificabilityByLabel[value]);
}

export { mapCertificabilityByLabel, certificabilityByLabel };
