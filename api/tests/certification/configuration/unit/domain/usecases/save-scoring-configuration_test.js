import { expect } from 'chai';
import sinon from 'sinon';

import { saveScoringConfiguration } from '../../../../../../src/certification/configuration/domain/usecases/save-scoring-configuration.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Unit | UseCase | save-scoring-configuration', function () {
  let versionRepository;

  beforeEach(function () {
    versionRepository = {
      getById: sinon.stub(),
      updateScoring: sinon.stub(),
    };
  });

  context('when the version does not exist', function () {
    it('throws a NotFoundError', async function () {
      // given
      versionRepository.getById.resolves(null);

      // when
      const err = await catchErr(saveScoringConfiguration)({
        id: 99,
        globalScoringConfiguration: [],
        competencesScoringConfiguration: null,
        versionRepository,
      });

      // then
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the version exists', function () {
    it('calls updateScoring with the right parameters', async function () {
      // given
      const version = domainBuilder.certification.configuration
        .versionBuilder()
        .asActive()
        .withParameters({ id: 42 })
        .build();
      versionRepository.getById.resolves(version);
      versionRepository.updateScoring.resolves();

      const globalScoringConfiguration = [{ meshLevel: 1, bounds: { min: 0, max: 100 } }];
      const competencesScoringConfiguration = null;

      // when
      await saveScoringConfiguration({
        id: 42,
        globalScoringConfiguration,
        competencesScoringConfiguration,
        versionRepository,
      });

      // then
      sinon.assert.calledWithExactly(versionRepository.updateScoring, {
        id: 42,
        globalScoringConfiguration,
        competencesScoringConfiguration,
      });
    });
  });
});
