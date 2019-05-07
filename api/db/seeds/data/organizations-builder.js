module.exports = function organizationsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildOrganization({
    id: 2,
    type: 'SUP',
    name: 'Tyrion SUP',
    code: 'SUPTY'
  });

  databaseBuilder.factory.buildOrganization({
    id: 3,
    type: 'SCO',
    name: 'The Night Watch',
    code: 'SCO12',
    isManagingStudents: true,
  });

  databaseBuilder.factory.buildStudent({
    id: 1,
    firstName: 'Eddison',
    lastName: 'Tollett',
    organizationId: 3,
    userId: null
  });
};
