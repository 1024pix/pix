import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
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
    databaseBuilder.factory.buildCertificationVersion({
      id: 123,
      scope: SCOPES.PIX_PLUS_PRO_SANTE,
      status: VERSION_STATUSES.DRAFT,
      startDate: new Date('2025-01-01'),
      expirationDate: null,
      assessmentDuration: 111,
      minimumAnswersRequiredToValidateACertification: 222,
      globalScoringConfiguration: [],
      competencesScoringConfiguration: [],
      challengesConfiguration: {
        maximumAssessmentLength: 1,
        challengesBetweenSameCompetence: 1,
        defaultProbabilityToPickChallenge: 1,
        variationPercent: 0.1,
        defaultCandidateCapacity: 1,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
      },
    });
    databaseBuilder.factory.buildCertificationVersionTube({
      tubeId: 'coucou',
      versionId: 123,
    });
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
      comments: 'COUCOU',
    });

    // then
    const updatedVersion = await versionRepository.getById({ id: 123 });
    expect(updatedVersion).to.deepEqualInstance(
      domainBuilder.certification.configuration.buildVersion({
        id: 123,
        scope: SCOPES.PIX_PLUS_PRO_SANTE,
        status: VERSION_STATUSES.DRAFT,
        expirationDate: null,
        startDate: new Date('2026-06-06'),
        comments: 'COUCOU',
        assessmentDuration: 100,
        minimumAnswersRequiredToValidateACertification: 200,
        globalScoringConfiguration: [],
        competencesScoringConfiguration: [],
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
      }),
    );
  });

  it('throws an error when no version is found', async function () {
    // given
    databaseBuilder.factory.buildCertificationVersion({ id: 123 });
    databaseBuilder.factory.buildCertificationVersionTube({
      tubeId: 'coucou',
      versionId: 123,
    });
    await databaseBuilder.commit();

    // when
    const error = await catchErr(usecases.updateVersion)({ id: 456, comments: 'new comments' });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
  });
});
