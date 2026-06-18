import sinon from 'sinon';

import { CertificationVersionDraftAlreadyExistError } from '../../../../../../src/certification/configuration/domain/errors.js';
import { createDraft } from '../../../../../../src/certification/configuration/domain/usecases/create-draft.js';
import {
  DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
  DEFAULT_PROBABILITY_TO_PICK_CHALLENGE,
  DEFAULT_SESSION_DURATION_MINUTES,
} from '../../../../../../src/certification/shared/domain/constants.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
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
      create: sinon.stub(),
    };
    challengeRepository = {
      findValidatedIdsByTubeIdsAndLocales: sinon.stub(),
    };
    versionRepository = {
      findAllByScope: sinon.stub(),
      create: sinon.stub(),
    };

    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
  });

  context('when there is already a draft certification version in the same scope', function () {
    it('should throw an error', async function () {
      // given
      const coreVersionActive = domainBuilder.certification.configuration.buildVersion({
        scope: SCOPES.CORE,
        startDate: new Date('2024-01-01'),
        expirationDate: null,
      });
      const coreVersionDraft = domainBuilder.certification.configuration.buildVersion({
        scope: SCOPES.CORE,
        startDate: null,
        expirationDate: null,
      });
      versionRepository.findAllByScope.withArgs({ scope: SCOPES.CORE }).resolves([coreVersionDraft, coreVersionActive]);

      // when
      const error = await catchErr(createDraft)({
        scope: SCOPES.CORE,
        tubeIds: ['someTubeId'],
        frameworkChallengesRepository,
        challengeRepository,
        versionRepository,
      });

      // then
      expect(versionRepository.create).to.not.have.been.called;
      expect(frameworkChallengesRepository.create).to.not.have.been.called;
      expect(error instanceof CertificationVersionDraftAlreadyExistError).to.be.true;
    });
  });

  context('when there is no draft version in the same scope', function () {
    context('when there is an active version in the scope', function () {
      it('should create a new certification version based on the active one', async function () {
        // given
        const activeVersion = domainBuilder.certification.configuration.buildVersion({
          scope: SCOPES.CORE,
          startDate: new Date('2024-01-01'),
          expirationDate: null,
          assessmentDuration: 111,
          minimumAnswersRequiredToValidateACertification: 222,
          globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
          competencesScoringConfiguration: [
            { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
          ],
          comments: 'some comments',
        });
        const tubeIds = ['recTube1', 'recTube2'];
        const challengeIds = ['challenge1', 'challenge2'];

        versionRepository.findAllByScope.withArgs({ scope: SCOPES.CORE }).resolves([activeVersion]);
        challengeRepository.findValidatedIdsByTubeIdsAndLocales
          .withArgs(['recTube1', 'recTube2'], [FRENCH_SPOKEN, ENGLISH_SPOKEN, FRENCH_FRANCE])
          .resolves(challengeIds);
        versionRepository.create.resolves(66);

        // when
        const id = await createDraft({
          scope: SCOPES.CORE,
          tubeIds,
          frameworkChallengesRepository,
          challengeRepository,
          versionRepository,
        });

        // then
        expect(id).to.equal(66);
        expect(versionRepository.create).to.have.been.calledOnceWithExactly(
          domainBuilder.certification.configuration.buildVersion({
            id: null,
            scope: SCOPES.CORE,
            startDate: null,
            expirationDate: null,
            assessmentDuration: 111,
            minimumAnswersRequiredToValidateACertification: 222,
            globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
            competencesScoringConfiguration: [
              { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
            ],
            comments: null,
          }),
        );
        expect(frameworkChallengesRepository.create).to.have.been.calledOnce.calledOnceWithExactly([
          domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
            versionId: 66,
            challengeId: 'challenge1',
            discriminant: null,
            difficulty: null,
          }),
          domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
            versionId: 66,
            challengeId: 'challenge2',
            discriminant: null,
            difficulty: null,
          }),
        ]);
      });
    });
    context('when there is no active version in the scope', function () {
      it('should create a new certification version from default values', async function () {
        // given
        const tubeIds = ['recTube1', 'recTube2'];
        const challengeIds = ['challenge1', 'challenge2'];
        versionRepository.findAllByScope.withArgs({ scope: SCOPES.CORE }).resolves([]);
        challengeRepository.findValidatedIdsByTubeIdsAndLocales
          .withArgs(['recTube1', 'recTube2'], [FRENCH_SPOKEN, ENGLISH_SPOKEN, FRENCH_FRANCE])
          .resolves(challengeIds);
        versionRepository.create.resolves(66);

        // when
        const id = await createDraft({
          scope: SCOPES.CORE,
          tubeIds,
          frameworkChallengesRepository,
          challengeRepository,
          versionRepository,
        });

        // then
        expect(id).to.equal(66);
        expect(versionRepository.create).to.have.been.calledOnceWithExactly(
          domainBuilder.certification.configuration.buildVersion({
            id: null,
            scope: SCOPES.CORE,
            startDate: null,
            expirationDate: null,
            assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
            minimumAnswersRequiredToValidateACertification:
              DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
            globalScoringConfiguration: [],
            competencesScoringConfiguration: [],
            challengesConfiguration: domainBuilder.buildFlashAlgorithmConfiguration({
              maximumAssessmentLength: 32,
              challengesBetweenSameCompetence: 0,
              limitToOneQuestionPerTube: true,
              enablePassageByAllCompetences: true,
              variationPercent: 1,
              defaultCandidateCapacity: 0,
              defaultProbabilityToPickChallenge: DEFAULT_PROBABILITY_TO_PICK_CHALLENGE,
            }),
            comments: null,
          }),
        );
        expect(frameworkChallengesRepository.create).to.have.been.calledOnce.calledOnceWithExactly([
          domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
            versionId: 66,
            challengeId: 'challenge1',
            discriminant: null,
            difficulty: null,
          }),
          domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
            versionId: 66,
            challengeId: 'challenge2',
            discriminant: null,
            difficulty: null,
          }),
        ]);
      });
    });
  });
});
