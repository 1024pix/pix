import { expect } from 'chai';
import sinon from 'sinon';

import {
  defaultCompetencesScoringConfiguration,
  defaultGlobalScoringConfiguration,
} from '../../../../../../db/database-builder/factory/build-certification-version.js';
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
      update: sinon.stub(),
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
      versionRepository.update.resolves();
      certificationCoursesToScoreRepository.findIdsByVersionId.resolves([]);
      scoreCertificationJobRepository.performAsync.resolves();
    });

    it('calls setScoringConfiguration with the right parameters and update', async function () {
      // given
      const globalScoringConfiguration = structuredClone(defaultGlobalScoringConfiguration);
      const competencesScoringConfiguration = structuredClone(defaultCompetencesScoringConfiguration);
      const setScoringConfigurationSpy = sinon.spy(version, 'setScoringConfiguration');

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
      sinon.assert.calledWithExactly(
        setScoringConfigurationSpy,
        globalScoringConfiguration,
        competencesScoringConfiguration,
      );
      sinon.assert.calledWithExactly(versionRepository.update, version);
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
