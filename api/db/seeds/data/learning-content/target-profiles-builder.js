const { createTargetProfile } = require('./tooling');
const { PRO_COMPANY_ID } = require('../organizations-pro-builder');

async function richTargetProfilesBuilder({ databaseBuilder }) {
  let config = {
    frameworks: [{
      chooseCoreFramework: true,
      countTubes: 30,
      minLevel: 3,
      maxLevel: 5,
    }],
  };
  await createTargetProfile({
    databaseBuilder,
    targetProfileId: 500,
    name: 'Profil cible Pur Pix (Niv3 ~ 5)',
    isPublic: true,
    ownerOrganizationId: PRO_COMPANY_ID,
    isSimplifiedAccess: false,
    description: 'Profil cible pur pix (Niv3 ~ 5)',
    config,
  });
  config = {
    frameworks: [{
      chooseCoreFramework: true,
      countTubes: 5,
      minLevel: 1,
      maxLevel: 8,
    }, {
      chooseCoreFramework: false,
      countTubes: 3,
      minLevel: 1,
      maxLevel: 8,
    }],
  };
  await createTargetProfile({
    databaseBuilder,
    targetProfileId: 501,
    name: 'Profil cible Pix et un autre réf (Niv1 ~ 8)',
    isPublic: true,
    ownerOrganizationId: PRO_COMPANY_ID,
    isSimplifiedAccess: false,
    description: 'Profil cible pur pix et un autre réf (Niv1 ~ 8)',
    config,
  });
}

module.exports = {
  richTargetProfilesBuilder,
};
