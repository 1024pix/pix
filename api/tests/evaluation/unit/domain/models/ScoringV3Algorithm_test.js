import sinon from 'sinon';

import { ScoringV3Algorithm } from '../../../../../src/certification/evaluation/domain/models/ScoringV3Algorithm.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Unit | Domain | Models | ScoringV3Algorithm ', function () {
  let algorithm, allAnswers, allChallenges, askedChallenges, flashAssessmentAlgorithmConfiguration;
  let v3CertificationScoring, downgradeCapacityStub;
  let scoringV3Algorithm;

  beforeEach(function () {
    v3CertificationScoring = domainBuilder.buildV3CertificationScoring();
    allAnswers = Symbol('allAnswers');
    allChallenges = Symbol('allChallenges');
    askedChallenges = Symbol('askedChallenges');
    flashAssessmentAlgorithmConfiguration = Symbol('flashAssessmentAlgorithmConfiguration');
    algorithm = {
      getCapacityAndErrorRate: sinon.stub(),
      getConfiguration: sinon.stub().returns(flashAssessmentAlgorithmConfiguration),
    };
    downgradeCapacityStub = sinon.stub().throws(new Error('Stub should not be called'));
    scoringV3Algorithm = new ScoringV3Algorithm({
      algorithm,
      allAnswers,
      allChallenges,
      askedChallenges,
      v3CertificationScoring,
      downgradeCapacityFunction: downgradeCapacityStub,
    });
  });

  context('#computeCapacity', function () {
    it('should compute the capacity without degradation when no degradation required', function () {
      algorithm.getCapacityAndErrorRate
        .withArgs({
          challenges: askedChallenges,
          allAnswers,
        })
        .returns({
          capacity: 2,
        });

      const capacity = scoringV3Algorithm.computeCapacity({ shouldDowngradeCapacity: false });

      expect(capacity).to.be.equal(2);
    });

    it('should compute the capacity with degradation when degradation is required', function () {
      algorithm.getCapacityAndErrorRate
        .withArgs({
          challenges: askedChallenges,
          allAnswers,
        })
        .returns({
          capacity: 2,
        });
      downgradeCapacityStub
        .withArgs({
          algorithm,
          capacity: 2,
          allChallenges,
          allAnswers,
          flashAssessmentAlgorithmConfiguration,
        })
        .returns(1);

      const capacity = scoringV3Algorithm.computeCapacity({ shouldDowngradeCapacity: true });

      expect(capacity).to.be.equal(1);
    });
  });

  context('#computePixScoreFromCapacity', function () {
    it('return computed pixScore from capacity', function () {
      const pixScore = scoringV3Algorithm.computePixScoreFromCapacity({ capacity: 2 });

      expect(pixScore).to.equal(438);
    });

    context('when we reach an estimated level below the MINIMUM', function () {
      it('the score should be 0', function () {
        const pixScore = scoringV3Algorithm.computePixScoreFromCapacity({ capacity: -8 });

        expect(pixScore).to.equal(0);
      });
    });

    context('when we reach an estimated level above the MAXIMUM', function () {
      it('the score should be the maximum score reachable at the moment', function () {
        const pixScore = scoringV3Algorithm.computePixScoreFromCapacity({ capacity: 8 });

        expect(pixScore).to.equal(895);
      });
    });
  });

  context('#computeReachedMeshIndex', function () {
    it('should return the interval index for a given capacity', function () {
      const reachedMeshIndex = scoringV3Algorithm.computeReachedMeshIndex({ capacity: 2 });

      expect(reachedMeshIndex).to.equal(4);
    });

    context('when capacity is below the minimum mesh', function () {
      it('should return null', function () {
        const reachedMeshIndex = scoringV3Algorithm.computeReachedMeshIndex({ capacity: -8 });

        expect(reachedMeshIndex).to.be.null;
      });
    });
  });
});
