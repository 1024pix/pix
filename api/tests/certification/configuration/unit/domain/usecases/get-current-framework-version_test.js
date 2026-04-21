import sinon from 'sinon';

import { getCurrentFrameworkVersion } from '../../../../../../src/certification/configuration/domain/usecases/get-current-framework-version.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Unit | UseCase | get-current-framework-version', function () {
  let versionRepository, frameworkChallengesRepository, learningContentRepository;

  beforeEach(function () {
    versionRepository = {
      findActiveByScope: sinon.stub(),
    };

    frameworkChallengesRepository = {
      getByVersionId: sinon.stub(),
    };

    learningContentRepository = {
      getFrameworkReferential: sinon.stub(),
    };
  });

  it('should return the current framework', async function () {
    // given
    const scope = SCOPES.PIX_PLUS_DROIT;
    const versionId = 123;
    const version = domainBuilder.certification.configuration.buildVersion({
      id: versionId,
      scope,
    });

    const challenges = [
      domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
        versionId,
        challengeId: 'rec1',
      }),
    ];

    versionRepository.findActiveByScope.withArgs({ scope }).resolves(version);

    frameworkChallengesRepository.getByVersionId.withArgs({ versionId }).resolves(challenges);

    const area = domainBuilder.buildArea();
    learningContentRepository.getFrameworkReferential.resolves([area]);

    // when
    const results = await getCurrentFrameworkVersion({
      scope,
      versionRepository,
      frameworkChallengesRepository,
      learningContentRepository,
    });

    // then
    expect(versionRepository.findActiveByScope).to.have.been.calledOnceWithExactly({ scope });

    expect(frameworkChallengesRepository.getByVersionId).to.have.been.calledOnceWithExactly({ versionId });

    expect(learningContentRepository.getFrameworkReferential).to.have.been.calledOnceWithExactly({
      challengeIds: ['rec1'],
    });

    expect(results.scope).to.equal(scope);
    expect(results.versionId).to.equal(versionId);
    expect(results.areas).to.deep.equal([area]);
  });

  it('should throw NotFoundError when no active version exists', async function () {
    // given
    const scope = SCOPES.PIX_PLUS_DROIT;

    versionRepository.findActiveByScope.withArgs({ scope }).resolves(null);

    // when
    const error = await catchErr(getCurrentFrameworkVersion)({
      scope,
      versionRepository,
      frameworkChallengesRepository,
      learningContentRepository,
    });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
    expect(error.message).to.equal(`There is no framework for complementary ${scope}`);
  });
});
