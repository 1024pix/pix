import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @param {Object} params
 * @param {number} params.[keys] - complementary certification key
 * @returns {Promise<number>} - number of rows affected
 */
export const deleteAllByComplementaryKey = async function ({ keys } = {}) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('complementary-certification-habilitations')
    .whereIn('complementaryCertificationId', async (builder) => {
      return builder.from('complementary-certifications').select('id').whereIn('key', keys);
    })
    .delete();
};
