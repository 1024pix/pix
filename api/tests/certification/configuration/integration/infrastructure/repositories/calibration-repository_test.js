import { expect } from 'chai';

import {
  CALIBRATION_SCOPES,
  CALIBRATION_STATUSES,
  CalibrationScoringMesh,
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

    context('scoring meshes', function () {
      it('returns no mesh when Data has not delivered any mesh set', async function () {
        // given
        await domainBuilder.certification.configuration
          .calibrationBuilder()
          .asValidated({ startedAt: new Date('2026-03-04') })
          .withParameters({ id: 113 })
          .insertToDB({ datamartBuilder });

        await datamartBuilder.commit();

        // when
        const calibration = await calibrationRepository.find(113);

        // then
        expect(calibration.scoringMeshes).to.deep.equal([]);
      });

      it('returns the meshes ordered by mesh, with their curated bounds', async function () {
        // given
        await domainBuilder.certification.configuration
          .calibrationBuilder()
          .asValidated({ startedAt: new Date('2026-03-04') })
          .withParameters({ id: 113 })
          .withScoringMeshes([
            { mesh: 1, minBoundCuratedValue: -1.4, maxBoundCuratedValue: 0.6 },
            { mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 },
          ])
          .insertToDB({ datamartBuilder });

        await datamartBuilder.commit();

        // when
        const calibration = await calibrationRepository.find(113);

        // then
        expect(calibration.scoringMeshes).to.deep.equal([
          new CalibrationScoringMesh({ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }),
          new CalibrationScoringMesh({ mesh: 1, minBoundCuratedValue: -1.4, maxBoundCuratedValue: 0.6 }),
        ]);
      });

      it('ignores a mesh set that is not validated, even on a validated calibration', async function () {
        // given
        await domainBuilder.certification.configuration
          .calibrationBuilder()
          .asValidated({ startedAt: new Date('2026-03-04') })
          .withParameters({ id: 113 })
          .withScoringMeshes([{ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }], {
            status: CALIBRATION_STATUSES.TO_VALIDATE,
          })
          .insertToDB({ datamartBuilder });

        await datamartBuilder.commit();

        // when
        const calibration = await calibrationRepository.find(113);

        // then
        expect(calibration.status).to.equal(CALIBRATION_STATUSES.VALIDATED);
        expect(calibration.scoringMeshes).to.deep.equal([]);
      });

      it('does not pick the mesh set of another calibration', async function () {
        // given
        await domainBuilder.certification.configuration
          .calibrationBuilder()
          .asValidated({ startedAt: new Date('2026-03-04') })
          .withParameters({ id: 113 })
          .insertToDB({ datamartBuilder });
        await domainBuilder.certification.configuration
          .calibrationBuilder()
          .asValidated({ startedAt: new Date('2026-03-04') })
          .withParameters({ id: 115 })
          .withScoringMeshes([{ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }])
          .insertToDB({ datamartBuilder });

        await datamartBuilder.commit();

        // when
        const calibration = await calibrationRepository.find(113);

        // then
        expect(calibration.scoringMeshes).to.deep.equal([]);
      });
    });
  });
});
