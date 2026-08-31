import { expect } from 'chai';

import * as calibratedChallengesRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/calibrated-challenges-repository.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Integration | Repository | CalibratedChallenges', function () {
  describe('#saveMany', function () {
    it('inserts all calibrated challenges for the given version id', async function () {
      // given
      const version = domainBuilder.certification.configuration
        .versionBuilder()
        .asDraft({ startDate: new Date('2025-01-01') })
        .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA', 'tubeB'], id: 1 })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      const calibratedChallenges = [
        { challengeId: 'chalA', tubeId: 'tubeA', alpha: 1.5, delta: -0.5 },
        { challengeId: 'chalB', tubeId: 'tubeB', alpha: 2.1, delta: 0.3 },
      ];

      // when
      await calibratedChallengesRepository.saveMany({ calibratedChallenges, versionId: version.id });

      // then
      const rows = await knex('certification-frameworks-challenges')
        .where({ versionId: version.id })
        .orderBy('challengeId');
      expect(rows).to.have.lengthOf(2);
      expect(rows[0]).to.include({ challengeId: 'chalA', discriminant: 1.5, difficulty: -0.5, versionId: version.id });
      expect(rows[1]).to.include({ challengeId: 'chalB', discriminant: 2.1, difficulty: 0.3, versionId: version.id });
    });
  });
});
