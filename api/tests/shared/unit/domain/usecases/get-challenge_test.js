import { getChallenge } from '../../../../../src/shared/domain/usecases/get-challenge.js';
import { sinon, expect, domainBuilder } from '../../../../test-helper.js';

describe('Unit | Shared | Domain | UseCases | getChallenge', function () {
  let dependencies;

  beforeEach(function () {
    dependencies = {
      challengeRepository: {
        get: sinon.stub(),
      },
      randomDataService: {
        generateChallengeVariables: sinon.stub(),
      },
    };
  });

  it('should return a challenge by ID', async function () {
    // given
    const challengeId = 'challenge3094783295';
    const challenge = domainBuilder.buildChallenge({ id: challengeId });

    dependencies.challengeRepository.get.withArgs(challengeId).resolves(challenge);

    // when
    const result = await getChallenge({ challengeId, ...dependencies });

    // then
    expect(result).to.equal(challenge);
    expect(dependencies.challengeRepository.get).to.have.been.calledOnceWithExactly(challengeId);
  });

  describe("when challenge's instruction has variables", function () {
    const instruction = `---
variables:
  - name: foo
    type: integer
    params:
      min: 0
      max: 1000
---
Est-ce que {% $foo %} c'est beaucoup ?`;

    it('should generate challenge variables using randomDataService', async function () {
      // given
      const challengeId = 'challenge3094783295';
      const assessmentId = 937625;
      const challenge = domainBuilder.buildChallenge({ id: challengeId, instruction });

      dependencies.challengeRepository.get.withArgs(challengeId).resolves(challenge);

      // when
      const result = await getChallenge({ challengeId, assessmentId, ...dependencies });

      // then
      expect(result).to.equal(challenge);
      expect(dependencies.challengeRepository.get).to.have.been.calledOnceWithExactly(challengeId);
      expect(dependencies.randomDataService.generateChallengeVariables).to.have.been.calledOnceWith({
        challenge,
        assessmentId,
      });
    });

    describe('when no assessmentId is received', function () {
      it('should give default assessmentId 1 for randomDataService', async function () {
        // given
        const challengeId = 'challenge3094783295';
        const challenge = domainBuilder.buildChallenge({ id: challengeId, instruction });

        dependencies.challengeRepository.get.withArgs(challengeId).resolves(challenge);

        // when
        const result = await getChallenge({ challengeId, ...dependencies });

        // then
        expect(result).to.equal(challenge);
        expect(dependencies.challengeRepository.get).to.have.been.calledOnceWithExactly(challengeId);
        expect(dependencies.randomDataService.generateChallengeVariables).to.have.been.calledOnceWith({
          challenge,
          assessmentId: 1,
        });
      });
    });
  });
});
