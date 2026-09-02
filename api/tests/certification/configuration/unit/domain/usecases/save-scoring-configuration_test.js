import { expect } from 'chai';
import sinon from 'sinon';

import { ScoreCertificationJob } from '../../../../../../src/certification/configuration/domain/models/ScoreCertificationJob.js';
import { saveScoringConfiguration } from '../../../../../../src/certification/configuration/domain/usecases/save-scoring-configuration.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Unit | UseCase | save-scoring-configuration', function () {
  let versionRepository;
  let certificationCoursesToScoreRepository;
  let scoreCertificationJobRepository;

  beforeEach(function () {
    versionRepository = {
      getById: sinon.stub(),
      updateScoring: sinon.stub(),
    };
    certificationCoursesToScoreRepository = {
      findIdsByVersionId: sinon.stub(),
    };
    scoreCertificationJobRepository = {
      performAsync: sinon.stub(),
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
        certificationCoursesToScoreRepository,
        scoreCertificationJobRepository,
      });

      // then
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the version exists', function () {
    let version;

    beforeEach(function () {
      version = domainBuilder.certification.configuration
        .versionBuilder()
        .asActive()
        .withParameters({ id: 42 })
        .build();
      versionRepository.getById.resolves(version);
      versionRepository.updateScoring.resolves();
      certificationCoursesToScoreRepository.findIdsByVersionId.resolves([]);
      scoreCertificationJobRepository.performAsync.resolves();
    });

    it('calls updateScoring with the right parameters', async function () {
      // given
      const globalScoringConfiguration = [{ meshLevel: 1, bounds: { min: 0, max: 100 } }];
      const competencesScoringConfiguration = null;

      // when
      await saveScoringConfiguration({
        id: 42,
        globalScoringConfiguration,
        competencesScoringConfiguration,
        versionRepository,
        certificationCoursesToScoreRepository,
        scoreCertificationJobRepository,
      });

      // then
      sinon.assert.calledWithExactly(versionRepository.updateScoring, {
        id: 42,
        globalScoringConfiguration,
        competencesScoringConfiguration,
      });
    });

    it('enqueues a ScoreCertificationJob for each certification course on finalized sessions', async function () {
      // given
      certificationCoursesToScoreRepository.findIdsByVersionId.resolves([10, 20, 30]);

      // when
      await saveScoringConfiguration({
        id: 42,
        globalScoringConfiguration: [],
        competencesScoringConfiguration: null,
        versionRepository,
        certificationCoursesToScoreRepository,
        scoreCertificationJobRepository,
      });

      // then
      sinon.assert.calledWithExactly(certificationCoursesToScoreRepository.findIdsByVersionId, { versionId: 42 });
      sinon.assert.calledWithExactly(
        scoreCertificationJobRepository.performAsync,
        new ScoreCertificationJob({ certificationCourseId: 10 }),
        new ScoreCertificationJob({ certificationCourseId: 20 }),
        new ScoreCertificationJob({ certificationCourseId: 30 }),
      );
    });

    it('enqueues no job when no certification courses are found', async function () {
      // given
      certificationCoursesToScoreRepository.findIdsByVersionId.resolves([]);

      // when
      await saveScoringConfiguration({
        id: 42,
        globalScoringConfiguration: [],
        competencesScoringConfiguration: null,
        versionRepository,
        certificationCoursesToScoreRepository,
        scoreCertificationJobRepository,
      });

      // then
      sinon.assert.calledWithExactly(scoreCertificationJobRepository.performAsync);
    });
  });
});
