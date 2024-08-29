import _ from 'lodash';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

export async function findHowManyVersionsBehindByComplementaryCertificationBadgeId() {
  const knexConn = DomainTransaction.getConnection();
  const howManyVersionsBehindByComplementaryCertificationBadgeId = {};
  const allComplementaryCertificationBadgeData = await knexConn('complementary-certification-badges').select([
    'id',
    'level',
    'complementaryCertificationId',
    'detachedAt',
  ]);
  const groupedByLevelAndComplementaryCertificationId = _.groupBy(
    allComplementaryCertificationBadgeData,
    ({ level, complementaryCertificationId }) => `${level}_${complementaryCertificationId}`,
  );
  for (const sameLevelComplementaryBadgesData of Object.values(groupedByLevelAndComplementaryCertificationId)) {
    const sortedByDetachedAtDescNullFirst = sameLevelComplementaryBadgesData.sort(sortByDetachedAtDescNullsFirst);
    let versionsBehind = sortedByDetachedAtDescNullFirst[0].detachedAt === null ? 0 : 1;
    for (const { id } of sortedByDetachedAtDescNullFirst) {
      howManyVersionsBehindByComplementaryCertificationBadgeId[id] = versionsBehind;
      ++versionsBehind;
    }
  }
  return howManyVersionsBehindByComplementaryCertificationBadgeId;
}

function sortByDetachedAtDescNullsFirst(dataA, dataB) {
  if (dataA.detachedAt === null) return -1;
  if (dataB.detachedAt === null) return 1;
  return dataA.detachedAt.getTime() > dataB.detachedAt.getTime() ? -1 : 1;
}
