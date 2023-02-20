import BookshelfUser from '../orm-models/User';
import { UserNotFoundError } from '../../domain/errors';
import CertificationOfficer from '../../domain/models/CertificationOfficer';

export default {
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
