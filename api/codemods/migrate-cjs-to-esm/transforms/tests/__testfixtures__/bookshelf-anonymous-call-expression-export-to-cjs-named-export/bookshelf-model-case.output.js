const BookshelfOrganizationInvitation = Bookshelf.model(modelName, {
  tableName: 'organization-invitations',
  hasTimestamps: ['createdAt', 'updatedAt'],
  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },
}, {
  modelName,
});

module.exports = {
  BookshelfOrganizationInvitation: BookshelfOrganizationInvitation,
};
