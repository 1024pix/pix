import { usecases } from '../../../../../../src/certification/configuration/domain/usecases/index.js';
import * as versionRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/version-repository.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Integration | Domain | UseCase | update-version', function () {
  it('updates the version', async function () {
    // given
    domainBuilder.certification.configuration
      .versionBuilder()
      .asDraft({ startDate: new Date('2025-01-01') })
      .withParameters({
        id: 123,
        scope: SCOPES.PIX_PLUS_PRO_SANTE,
        assessmentDuration: 111,
        minimumAnswersRequiredToValidateACertification: 222,
        globalScoringConfiguration: [],
        competencesScoringConfiguration: [],
        comments: 'Not Modified',
        challengesConfiguration: {
          maximumAssessmentLength: 1,
          challengesBetweenSameCompetence: 1,
          defaultProbabilityToPickChallenge: 1,
          variationPercent: 0.1,
          defaultCandidateCapacity: 1,
          limitToOneQuestionPerTube: false,
          enablePassageByAllCompetences: false,
        },
        tubeIds: ['coucou'],
      })
      .insertToDB({ databaseBuilder });
    await databaseBuilder.commit();

    // when
    await usecases.updateVersion({
      id: 123,
      startDate: new Date('2026-06-06'),
      assessmentDuration: 100,
      minimumAnswersRequiredForValidation: 200,
      maximumAssessmentLength: 300,
      challengesBetweenSameCompetence: 400,
      defaultProbabilityToPickChallenge: 55,
      variationPercent: 0.6,
      defaultCandidateCapacity: 700,
      limitToOneQuestionPerTube: true,
      enablePassageByAllCompetences: true,
    });

    // then
    const updatedVersion = await versionRepository.getById({ id: 123 });
    expect(updatedVersion).to.deepEqualInstance(
      domainBuilder.certification.configuration
        .versionBuilder()
        .asDraft({ startDate: new Date('2026-06-06') })
        .withParameters({
          id: 123,
          scope: SCOPES.PIX_PLUS_PRO_SANTE,
          assessmentDuration: 100,
          minimumAnswersRequiredToValidateACertification: 200,
          globalScoringConfiguration: [],
          competencesScoringConfiguration: [],
          comments: 'Not Modified',
          challengesConfiguration: {
            maximumAssessmentLength: 300,
            challengesBetweenSameCompetence: 400,
            defaultProbabilityToPickChallenge: 55,
            variationPercent: 0.6,
            defaultCandidateCapacity: 700,
            limitToOneQuestionPerTube: true,
            enablePassageByAllCompetences: true,
          },
          tubeIds: ['coucou'],
        })
        .build(),
    );
  });

  it('throws an error when no version is found', async function () {
    // given
    domainBuilder.certification.configuration
      .versionBuilder()
      .asDraft({ startDate: new Date('2025-01-01') })
      .withParameters({ id: 456 })
      .insertToDB({ databaseBuilder });
    await databaseBuilder.commit();

    // when
    const error = await catchErr(usecases.updateVersion)({
      id: 123,
      startDate: new Date('2026-06-06'),
      assessmentDuration: 100,
      minimumAnswersRequiredForValidation: 200,
      maximumAssessmentLength: 300,
      challengesBetweenSameCompetence: 400,
      defaultProbabilityToPickChallenge: 55,
      variationPercent: 0.6,
      defaultCandidateCapacity: 700,
      limitToOneQuestionPerTube: true,
      enablePassageByAllCompetences: true,
    });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
  });
});
