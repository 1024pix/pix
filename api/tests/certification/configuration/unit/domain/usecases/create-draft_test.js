import sinon from 'sinon';

import { CertificationVersionDraftAlreadyExistError } from '../../../../../../src/certification/configuration/domain/errors.js';
import { createDraft } from '../../../../../../src/certification/configuration/domain/usecases/create-draft.js';
import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../../../../src/certification/shared/domain/constants.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import {
  ENGLISH_SPOKEN,
  FRENCH_FRANCE,
  FRENCH_SPOKEN,
} from '../../../../../../src/shared/domain/services/locale-service.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';
describe('Certification | Configuration | Unit | UseCase | create-certification-version', function () {
  let challengeRepository, versionRepository, frameworkChallengesRepository;

  beforeEach(function () {
    frameworkChallengesRepository = {
      createFromChallengeIds: sinon.stub(),
    };
    challengeRepository = {
      findValidatedBySkills: sinon.stub(),
      findValidatedIdsByTubeIdsAndLocales: sinon.stub(),
    };
    versionRepository = {
      findAll: sinon.stub(),
      create: sinon.stub(),
    };
  });

  context('when there is no draft version in the same scope', function () {
    it('should create a new certification version and create some certificationFrameworksChallenges', async function () {
      // given
      const santeVersion = domainBuilder.certification.configuration.buildVersion({
        id: 123,
        scope: SCOPES.PIX_PLUS_PRO_SANTE,
        startDate: new Date('2024-01-01'),
        expirationDate: null,
        assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
        globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
        competencesScoringConfiguration: [
          { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
        ],
      });
      const coreVersion = domainBuilder.certification.configuration.buildVersion({
        id: 23,
        scope: SCOPES.CORE,
        startDate: new Date('2024-01-01'),
        expirationDate: null,
        assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
        globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
        competencesScoringConfiguration: [
          { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
        ],
      });

      const tubeIds = ['recTube1', 'recTube2'];

      const challengeIds = ['challenge1', 'challenge2', 'challenge3', 'challenge4'];

      versionRepository.findAll.resolves([santeVersion, coreVersion]);
      challengeRepository.findValidatedIdsByTubeIdsAndLocales.resolves(challengeIds);
      versionRepository.create.resolves(domainBuilder.certification.configuration.buildVersion({ id: 42 }));

      // when
      await createDraft({
        scope: SCOPES.CORE,
        tubeIds,
        frameworkChallengesRepository,
        challengeRepository,
        versionRepository,
      });

      // then
      expect(versionRepository.findAll).to.have.been.calledOnce;
      expect(challengeRepository.findValidatedIdsByTubeIdsAndLocales).to.have.been.calledOnceWithExactly(
        ['recTube1', 'recTube2'],
        [FRENCH_SPOKEN, ENGLISH_SPOKEN, FRENCH_FRANCE],
      );
      expect(versionRepository.create).to.have.been.calledOnce;
      expect(frameworkChallengesRepository.createFromChallengeIds).to.have.been.calledOnce.calledOnceWithExactly({
        versionId: 42,
        challengeIds,
      });
    });
  });

  context('when there is already a draft certification version in the same scope', function () {
    it('should throw an error', async function () {
      // given
      const coreVersionActive = domainBuilder.certification.configuration.buildVersion({
        id: 123,
        scope: SCOPES.CORE,
        startDate: new Date('2024-01-01'),
        expirationDate: null,
        assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
        globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
        competencesScoringConfiguration: [
          { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
        ],
      });
      const coreVersionDraft = domainBuilder.certification.configuration.buildVersion({
        id: 23,
        scope: SCOPES.CORE,
        startDate: null,
        expirationDate: null,
        assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
        globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
        competencesScoringConfiguration: [
          { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
        ],
      });

      const tubeIds = ['recTube1', 'recTube2'];

      const challengeIds = ['challenge1', 'challenge2', 'challenge3', 'challenge4'];

      versionRepository.findAll.resolves([coreVersionDraft, coreVersionActive]);
      challengeRepository.findValidatedIdsByTubeIdsAndLocales.resolves(challengeIds);
      versionRepository.create.resolves();

      // when
      const error = await catchErr(createDraft)({
        scope: SCOPES.CORE,
        tubeIds,
        frameworkChallengesRepository,
        challengeRepository,
        versionRepository,
      });

      // then
      expect(versionRepository.findAll).to.have.been.calledOnce;
      expect(challengeRepository.findValidatedIdsByTubeIdsAndLocales).to.not.have.been.called;
      expect(versionRepository.create).to.not.have.been.called;
      expect(frameworkChallengesRepository.createFromChallengeIds).to.not.have.been.called;
      expect(error instanceof CertificationVersionDraftAlreadyExistError).to.be.true;
    });
  });
});
