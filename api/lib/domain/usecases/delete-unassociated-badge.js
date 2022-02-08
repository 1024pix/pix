const { BadgeForbiddenDeletionError } = require('../errors');

module.exports = async function deleteUnassociatedBadge({ badgeId, badgeRepository }) {
  const isAssociated = await badgeRepository.isAssociated(badgeId);

  if (isAssociated) {
    throw new BadgeForbiddenDeletionError();
  }

  return badgeRepository.delete(badgeId);
};
