import { expect } from 'chai';

import {
  cleanCalibrationTables,
  createCalibrationTables,
} from '../../../../../../db/database-builder/database-helpers.js';
import { CALIBRATION_SCOPES } from '../../../../../../src/certification/configuration/domain/models/Calibration.js';
import * as calibrationRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/calibration-repository.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Integration | Repository | calibration', function () {
  beforeEach(function () {
    return createCalibrationTables();
  });

  afterEach(function () {
    return cleanCalibrationTables();
  });

  describe('#find', function () {
    it('returns null when no calibration found for id', async function () {
      await domainBuilder.certification.configuration
        .calibrationBuilder()
        .asValidated({ startedAt: new Date('2026-03-04') })
        .onScope({ scope: CALIBRATION_SCOPES.DROIT })
        .withParameters({ id: 113 })
        .insertToDB();

      // when
      const calibration = await calibrationRepository.find(222);

      // then
      expect(calibration).to.be.null;
    });

    it('returns expected calibration when exists', async function () {
      const expectedCalibration = await domainBuilder.certification.configuration
        .calibrationBuilder()
        .asValidated({ startedAt: new Date('2026-03-04') })
        .onScope({ scope: CALIBRATION_SCOPES.DROIT })
        .withCalibratredChallenges([
          { id: 1, alpha: -5.34, delta: 3.321, challengeId: 'challengeA', tubeId: 'tubeA', isExcluded: true },
          { id: 3, alpha: 1.432, delta: -0.56, challengeId: 'challengeC1', tubeId: 'tubeC', isExcluded: false },
          { id: 2, alpha: -7.0129, delta: 6.11, challengeId: 'challengeB2', tubeId: 'tubeB', isExcluded: false },
          { id: 4, alpha: 1.234, delta: 5.098, challengeId: 'challengeC2', tubeId: 'tubeC', isExcluded: false },
          { id: 5, alpha: 0.872, delta: -2, challengeId: 'challengeB1', tubeId: 'tubeB', isExcluded: false },
        ])
        .withParameters({ id: 113 })
        .insertToDB();
      const learningContent = {
        skills: [
          {
            id: 'skillA',
            tubeId: 'tubeA',
          },
          {
            id: 'skillB1',
            tubeId: 'tubeB',
          },
          {
            id: 'skillB2',
            tubeId: 'tubeB',
          },
          {
            id: 'skillC',
            tubeId: 'tubeC',
          },
        ],
        challenges: [
          {
            id: 'challengeA',
            skillId: 'skillA',
          },
          {
            id: 'challengeC1',
            skillId: 'skillC',
          },
          {
            id: 'challengeC2',
            skillId: 'skillC',
          },
          {
            id: 'challengeB1',
            skillId: 'skillB1',
          },
          {
            id: 'challengeB2',
            skillId: 'skillB2',
          },
        ],
      };
      databaseBuilder.factory.learningContent.build(learningContent);
      await databaseBuilder.commit();

      // when
      const calibration = await calibrationRepository.find(113);

      // then
      expect(calibration).to.deep.equal(expectedCalibration);
      expect(calibration).to.be.instanceOf(expectedCalibration.constructor);
    });
  });
});
