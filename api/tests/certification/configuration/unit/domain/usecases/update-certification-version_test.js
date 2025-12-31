import { updateCertificationVersion } from '../../../../../../src/certification/configuration/domain/usecases/update-certification-version.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | update-certification-version', function () {
  let versionsRepository;

  beforeEach(function () {
    versionsRepository = {
      update: sinon.stub(),
    };
  });

  it('should call the repository update method with the updated version', async function () {
    const updatedVersion = domainBuilder.certification.configuration.buildVersion({
      id: 123,
      scope: SCOPES.PIX_PLUS_DROIT,
      startDate: new Date('2024-01-01'),
      expirationDate: new Date('2025-10-21T10:00:00Z'),
      assessmentDuration: 120,
      globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
      competencesScoringConfiguration: [
        { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
      ],
      challengesConfiguration: domainBuilder.buildFlashAlgorithmConfiguration({
        maximumAssessmentLength: 32,
        limitToOneQuestionPerTube: true,
        defaultCandidateCapacity: -3,
      }),
    });

    versionsRepository.update.resolves();

    await updateCertificationVersion({ updatedVersion, versionsRepository });

    expect(versionsRepository.update).to.have.been.calledOnceWithExactly({ version: updatedVersion });
  });
});
