const KNOWN_TARGETS = [
  'organization:administrationTeamName',
  'organization:organizationLearnerTypeName',
  'organization:countryName',
  'organization:type',
];

const listReferenceValues = async function ({
  target,
  administrationTeamRepository,
  organizationLearnerTypeRepository,
  countryRepository,
}) {
  if (target === 'organization:type') {
    return { target, values: [{ value: 'SCO' }, { value: 'SUP' }, { value: 'PRO' }, { value: 'SCO-1D' }] };
  }

  if (target === 'organization:administrationTeamName') {
    const teams = await administrationTeamRepository.findAll();
    const values = teams.map((t) => ({ value: t.name }));
    return { target, values };
  }

  if (target === 'organization:organizationLearnerTypeName') {
    const types = await organizationLearnerTypeRepository.findAll();
    const values = types.map((t) => ({ value: t.name }));
    return { target, values };
  }

  if (target === 'organization:countryName') {
    const countries = await countryRepository.findAll();
    const values = countries.map((c) => ({ value: c.name }));
    return { target, values };
  }

  // Cible inconnue : retourner une erreur avec les cibles connues
  return { target, error: 'unknown target', knownTargets: KNOWN_TARGETS };
};

export { KNOWN_TARGETS,listReferenceValues };
