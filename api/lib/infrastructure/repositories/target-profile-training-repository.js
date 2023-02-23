const { knex } = require('../../../db/knex-database-connection.js');
const DomainTransaction = require('../DomainTransaction.js');
const TABLE_NAME = 'target-profile-trainings';

module.exports = {
  async create({ trainingId, targetProfileIds, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    const targetProfileTrainingsToInsert = targetProfileIds.map((targetProfileId) => {
      return { trainingId, targetProfileId };
    });
    const attachedTargetProfileIds = await knexConn(TABLE_NAME)
      .insert(targetProfileTrainingsToInsert)
      .onConflict(['targetProfileId', 'trainingId'])
      .merge({ updatedAt: new Date() })
      .returning('targetProfileId')
      .orderBy('targetProfileId', 'asc');
    return attachedTargetProfileIds.map(({ targetProfileId }) => targetProfileId);
  },
};
