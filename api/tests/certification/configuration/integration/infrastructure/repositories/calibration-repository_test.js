import { expect } from 'chai';

import {
  CALIBRATION_SCOPES,
  CALIBRATION_STATUSES,
} from '../../../../../../src/certification/configuration/domain/models/Calibration.js';
import * as calibrationRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/calibration-repository.js';
import { databaseBuilder, datamartBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Integration | Repository | calibration', function () {
  describe('#find', function () {
    it('returns null when no calibration found for id', async function () {
      await domainBuilder.certification.configuration
        .calibrationBuilder()
        .asValidated({ startedAt: new Date('2026-03-04') })
        .onScope({ scope: CALIBRATION_SCOPES.DROIT })
        .withParameters({ id: 113 })
        .insertToDB({ datamartBuilder });

      await datamartBuilder.commit();

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
          {
            alpha: 1.432,
            delta: -0.56,
            challengeId: 'challengeC1',
            tubeId: 'tubeC',
          },
          {
            alpha: -7.0129,
            delta: 6.11,
            challengeId: 'challengeB2',
            tubeId: 'tubeB',
          },
          {
            alpha: 1.234,
            delta: 5.098,
            challengeId: 'challengeC2',
            tubeId: 'tubeC',
          },
          {
            alpha: 0.872,
            delta: -2,
            challengeId: 'challengeB1',
            tubeId: 'tubeB',
          },
        ])
        .withParameters({ id: 113 })
        .insertToDB({ datamartBuilder });

      await domainBuilder.certification.configuration
        .calibrationBuilder()
        .asValidated({ startedAt: new Date('2026-03-04') })
        .onScope({ scope: CALIBRATION_SCOPES.DROIT })
        .withCalibratredChallenges([
          {
            alpha: 1.931,
            delta: -0.891,
            challengeId: 'challenge1',
            tubeId: 'tubeA',
          },
        ])
        .withParameters({ id: 115 })
        .insertToDB({ datamartBuilder });

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
      await datamartBuilder.commit();

      // when
      const calibration = await calibrationRepository.find(113);

      // then
      expect(calibration).to.deep.equal(expectedCalibration);
      expect(calibration).to.be.instanceOf(expectedCalibration.constructor);
    });
  });

  describe('#findGlobalScoringConfiguration', function () {
    it('returns an empty configuration when the version points to no calibration', async function () {
      // when
      const globalScoringConfiguration = await calibrationRepository.findGlobalScoringConfiguration({
        calibrationId: null,
      });

      // then
      expect(globalScoringConfiguration).to.deep.equal([]);
    });

    it('returns an empty configuration when the calibration carries no validated scoring meshes', async function () {
      // given
      const notValidatedSet = datamartBuilder.factory.buildScoringMeshesAll({
        calibrationId: 113,
        status: CALIBRATION_STATUSES.TO_VALIDATE,
      });
      datamartBuilder.factory.buildScoringMesh({
        scoringMeshesAllId: notValidatedSet.id,
        mesh: 0,
        minBoundCuratedValue: -8,
        maxBoundCuratedValue: -2,
      });
      await datamartBuilder.commit();

      // when
      const globalScoringConfiguration = await calibrationRepository.findGlobalScoringConfiguration({
        calibrationId: 113,
      });

      // then
      expect(globalScoringConfiguration).to.deep.equal([]);
    });

    it('returns the validated scoring meshes of the calibration, ordered by mesh', async function () {
      // given
      const otherCalibrationSet = datamartBuilder.factory.buildScoringMeshesAll({
        calibrationId: 114,
        status: CALIBRATION_STATUSES.VALIDATED,
      });
      datamartBuilder.factory.buildScoringMesh({
        scoringMeshesAllId: otherCalibrationSet.id,
        mesh: 0,
        minBoundCuratedValue: -1,
        maxBoundCuratedValue: 1,
      });

      const validatedSet = datamartBuilder.factory.buildScoringMeshesAll({
        calibrationId: 113,
        status: CALIBRATION_STATUSES.VALIDATED,
      });
      datamartBuilder.factory.buildScoringMesh({
        scoringMeshesAllId: validatedSet.id,
        mesh: 1,
        minBoundCuratedValue: -2,
        maxBoundCuratedValue: 4.5,
      });
      datamartBuilder.factory.buildScoringMesh({
        scoringMeshesAllId: validatedSet.id,
        mesh: 0,
        minBoundCuratedValue: -8,
        maxBoundCuratedValue: -2,
      });
      await datamartBuilder.commit();

      // when
      const globalScoringConfiguration = await calibrationRepository.findGlobalScoringConfiguration({
        calibrationId: 113,
      });

      // then
      expect(globalScoringConfiguration).to.deep.equal([
        { meshLevel: 0, bounds: { min: -8, max: -2 } },
        { meshLevel: 1, bounds: { min: -2, max: 4.5 } },
      ]);
    });
  });
});
