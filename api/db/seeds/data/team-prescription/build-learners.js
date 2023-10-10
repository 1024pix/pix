import { SUP_MANAGING_ORGANIZATION_ID } from '../common/constants.js';

async function _createSupLearners(databasebuilder) {
  await databasebuilder.factory.buildOrganizationLearner({
    organizationId: SUP_MANAGING_ORGANIZATION_ID,
    lastName: 'Kenobi',
    preferredLastName: 'Kenobi',
    firstName: 'Jedi',
    middleName: 'Obi',
    thirdName: 'Wan',
    isDisabled: true,
  });

  await databasebuilder.factory.buildOrganizationLearner({
    organizationId: SUP_MANAGING_ORGANIZATION_ID,
    lastName: 'Skywalker',
    preferredLastName: 'Vador',
    firstName: 'Jedi',
    middleName: 'Anakin',
    thirdName: 'Skywalker',
    isDisabled: true,
  });
}

export function buildOrganizationLearners(databaseBuilder) {
  return _createSupLearners(databaseBuilder);
}
