import sinon from 'sinon';

import { getActiveVersionByScope } from '../../../../../../src/certification/configuration/domain/usecases/get-active-version-by-scope.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Unit | UseCase | get-active-version-by-scope', function () {
  let versionRepository;

  beforeEach(function () {
    versionRepository = {
      findActiveByScope: sinon.stub(),
    };
  });

  it('should call the repository findActiveByScope method with the scope', async function () {
    const scope = SCOPES.CORE;
    const expectedVersion = domainBuilder.certification.configuration.buildVersion({
      id: 123,
      scope: SCOPES.CORE,
      startDate: new Date('2024-01-01'),
      expirationDate: null,
      assessmentDuration: 120,
      globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
      competencesScoringConfiguration: [
        { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
      ],
    });

    versionRepository.findActiveByScope.resolves(expectedVersion);

    const result = await getActiveVersionByScope({ scope, versionRepository });

    expect(versionRepository.findActiveByScope).to.have.been.calledOnceWithExactly({ scope });
    expect(result).to.equal(expectedVersion);
  });

  it('should throw NotFoundError when no active version exists for the scope', async function () {
    const scope = SCOPES.CORE;

    versionRepository.findActiveByScope.resolves(null);

    const error = await catchErr(getActiveVersionByScope)({ scope, versionRepository });

    expect(error).to.be.instanceOf(NotFoundError);
    expect(error.message).to.equal('No active certification version found for scope: CORE');
  });
});
