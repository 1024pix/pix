import { BookshelfUser } from '../orm-models/User.js';
import { UserNotFoundError } from '../../domain/errors.js';
import { CertificationOfficer } from '../../domain/models/CertificationOfficer.js';

const get = async function (certificationOfficerId) {
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
};

export { get };

function _toDomain(certificationOfficer) {
  return new CertificationOfficer(certificationOfficer);
}
