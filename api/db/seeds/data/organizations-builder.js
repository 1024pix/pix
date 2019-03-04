module.exports = function organizationsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildOrganization({
    id: 2,
    userId: 3,
    type: 'SUP',
    name: 'Tyrion SUP',
    code: 'SUPTY'
  });
  databaseBuilder.factory.buildOrganization({
    id: 3,
    userId: 4,
    type: 'SCO',
    name: 'SCOw',
    code: 'SCO12'
  });
};
