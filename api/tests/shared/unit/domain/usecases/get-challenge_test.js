import { getChallenge } from '../../../../../src/shared/domain/usecases/get-challenge.js';
import { sinon, expect, domainBuilder } from '../../../../test-helper.js';

describe('Unit | Shared | Domain | UseCases | getChallenge', function () {
  let dependencies;

  beforeEach(function () {
    dependencies = {
      challengeRepository: {
        get: sinon.stub(),
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
});
