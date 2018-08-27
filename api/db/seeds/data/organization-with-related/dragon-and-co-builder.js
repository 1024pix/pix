module.exports = function addDragonAndCoWithrelated({ databaseBuilder }) {

  const dragonAndCoCompany = databaseBuilder.factory.buildOrganization({
    email: 'pro@example.net',
    type: 'PRO',
    name: 'Dragon & Co',
    userId: 2,
    code: 'DRAGO'
  });

  const privateTargetProfile = databaseBuilder.factory.buildTargetProfile({
    name: 'Résoudre des problèmes techniques (compétence 5.1)',
    isPublic: false,
    organizationId: dragonAndCoCompany.id,
  });

  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recGd7oJ2wVEyKmPS' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recHvlTH8v706UYvc' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recl2o6fA6oyMGPkb' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recVgnoo6RjCxjCQp' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recUQEnFmSvPBA807' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recINVk1gM5DHCbs7' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recpyHTeNkGnFnqhZ' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'rec9iiMaoi1GLzWVn' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'rec336WB21z6wKR6q' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recVywppdS4hGEekR' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recIcL3GuLDaDgGAt' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recOyQOjUhDKTO7UN' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recO6p9wxUDweUysu' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recrxbonOSuEvsuor' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recDZTKszXX02aXD1' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'rec8b2zEqznu1VdSu' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'rectZKS13rdkqxHer' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recW4iZCujkyyfCve' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recxij74P8pBL3pdq' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recmB2623CruGvA1b' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recIOtIleMBECQayX' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recEPgGwP6P3nZBbK' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recbZ44oYHqlOGJ2C' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recU78yTsZnxIghHA' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recDkqabsU2X5a4Z5' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recVv1eoSLW7yFgXv' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recvBiIG0dvHJOe7i' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'reca2TivtMI9QRWBY' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recSF5OuzyBOfg97L' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recUdMS2pRSF4sgnk' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recr9No0p5zGhq2bg' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recWalmeLbapvhX3K' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recKTybfk95zVWBDM' });
  databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: privateTargetProfile.id, skillId: 'recKFUQ2CzcYHrxPR' });
};
