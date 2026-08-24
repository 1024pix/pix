import sinon from 'sinon';

import { CleanCappedTubesCriteriaScript } from '../../../../src/prescription/scripts/clean-capped-tubes-criteria.js';
import { SCOPES } from '../../../../src/shared/domain/models/BadgeDetails.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
describe('Integration | Scripts | clean-capped-tubes-criteria', function () {
  let script;

  beforeEach(function () {
    script = new CleanCappedTubesCriteriaScript();
  });

  describe('handle', function () {
    let logger, badge;

    beforeEach(async function () {
      logger = { info: sinon.spy(), warn: sinon.spy() };
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: targetProfile.id,
        tubeId: 'tubeId1',
        level: 1,
      });
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: targetProfile.id,
        tubeId: 'tubeId2',
        level: 1,
      });
      badge = databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id });
      databaseBuilder.factory.buildBadgeCriterion({
        badgeId: badge.id,
        scope: SCOPES.CAPPED_TUBES,
        cappedTubes: JSON.stringify([
          { id: 'tubeId1', level: 1 },
          { id: 'tubeId2', level: 1 },
        ]),
      });
      databaseBuilder.factory.buildBadgeCriterion({
        badgeId: badge.id,
        scope: SCOPES.CAPPED_TUBES,
        cappedTubes: JSON.stringify([
          { id: 'tubeId1', level: 1 },
          { id: 'unknownTubeId', level: 1 },
        ]),
      });
      databaseBuilder.factory.buildBadgeCriterion({
        badgeId: badge.id,
        scope: SCOPES.CAPPED_TUBES,
        cappedTubes: JSON.stringify([
          { id: 'tubeId2', level: 1 },
          { id: 'unknownTubeId2', level: 1 },
          { id: 'unknownTubeId3', level: 1 },
        ]),
      });
      await databaseBuilder.commit();
    });

    describe('when dryRun is true', function () {
      it('should not persist any changes', async function () {
        await script.handle({ options: { dryRun: true }, logger });
        const criteria = await knex('badge-criteria').where({ badgeId: badge.id }).orderBy('id');

        expect(criteria.map((item) => item.cappedTubes)).deep.equal([
          [
            { id: 'tubeId1', level: 1 },
            { id: 'tubeId2', level: 1 },
          ],
          [
            { id: 'tubeId1', level: 1 },
            { id: 'unknownTubeId', level: 1 },
          ],
          [
            { id: 'tubeId2', level: 1 },
            { id: 'unknownTubeId2', level: 1 },
            { id: 'unknownTubeId3', level: 1 },
          ],
        ]);
      });
    });

    describe('when dryRun is false', function () {
      it('should remove cappedTube that are missing in the targetProfile', async function () {
        await script.handle({ options: { dryRun: false }, logger });
        const criteria = await knex('badge-criteria').where({ badgeId: badge.id }).orderBy('id');

        expect(criteria.map((item) => item.cappedTubes)).deep.equal([
          [
            { id: 'tubeId1', level: 1 },
            { id: 'tubeId2', level: 1 },
          ],
          [{ id: 'tubeId1', level: 1 }],
          [{ id: 'tubeId2', level: 1 }],
        ]);
      });
    });
  });
});
