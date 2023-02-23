const BookshelfUser = require('../orm-models/User.js');

const { UserNotFoundError } = require('../../domain/errors.js');
const CertificationOfficer = require('../../domain/models/CertificationOfficer.js');

module.exports = {
  async get(certificationOfficerId) {
    try {
      const certificationOfficer = await BookshelfUser.where({ id: certificationOfficerId }).fetch({
        columns: ['id', 'firstName', 'lastName'],
      });

      return _toDomain(certificationOfficer.attributes);
    } catch (error) {
      if (error instanceof BookshelfUser.NotFoundError) {
        throw new UserNotFoundError(`User not found for ID ${certificationOfficerId}`);
      }
      throw error;
    }
  },
};

function _toDomain(certificationOfficer) {
  return new CertificationOfficer(certificationOfficer);
}
