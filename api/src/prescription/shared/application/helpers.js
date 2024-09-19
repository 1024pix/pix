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

  return result
    .filter((value) => certificabilityByLabel[value] !== undefined)
    .map((value) => certificabilityByLabel[value]);
}

export { certificabilityByLabel, mapCertificabilityByLabel };
