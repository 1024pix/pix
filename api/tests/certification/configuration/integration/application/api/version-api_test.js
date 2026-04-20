import * as versionApi from '../../../../../../src/certification/configuration/application/api/version-api.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Integration | Application | Api | version', function () {
  const dataDroit2025 = {
    id: 1,
    scope: Frameworks.DROIT,
    startDate: new Date('2024-12-25'),
    expirationDate: new Date('2025-11-04'),
    assessmentDuration: 1,
    minimumAnswersRequiredToValidateACertification: 1,
    globalScoringConfiguration: [{ config: 'droit2025' }],
    competencesScoringConfiguration: [{ config: 'droit2025' }],
    challengesConfiguration: {
      maximumAssessmentLength: 1,
      challengesBetweenSameCompetence: 1,
      limitToOneQuestionPerTube: true,
      enablePassageByAllCompetences: true,
      variationPercent: 0.1,
      defaultCandidateCapacity: 1,
      defaultProbabilityToPickChallenge: 1,
    },
  };
  const dataDroitCurrent = {
    id: 2,
    scope: Frameworks.DROIT,
    startDate: new Date('2026-01-01'),
    expirationDate: null,
    assessmentDuration: 2,
    minimumAnswersRequiredToValidateACertification: 2,
    globalScoringConfiguration: [{ config: 'droitCurrent' }],
    competencesScoringConfiguration: [{ config: 'droitCurrent' }],
    challengesConfiguration: {
      maximumAssessmentLength: 2,
      challengesBetweenSameCompetence: 2,
      limitToOneQuestionPerTube: false,
      enablePassageByAllCompetences: false,
      variationPercent: 0.2,
      defaultCandidateCapacity: 2,
      defaultProbabilityToPickChallenge: 2,
    },
  };
  const dataCore2024 = {
    id: 3,
    scope: Frameworks.CORE,
    startDate: new Date('2024-02-02'),
    expirationDate: new Date('2024-12-01'),
    assessmentDuration: 3,
    minimumAnswersRequiredToValidateACertification: 3,
    globalScoringConfiguration: [{ config: 'core2024' }],
    competencesScoringConfiguration: [{ config: 'core2024' }],
    challengesConfiguration: {
      maximumAssessmentLength: 3,
      challengesBetweenSameCompetence: 3,
      limitToOneQuestionPerTube: true,
      enablePassageByAllCompetences: true,
      variationPercent: 0.3,
      defaultCandidateCapacity: 3,
      defaultProbabilityToPickChallenge: 3,
    },
  };
  const dataCore2025 = {
    id: 4,
    scope: Frameworks.CORE,
    startDate: new Date('2025-02-02'),
    expirationDate: new Date('2025-12-01'),
    assessmentDuration: 4,
    minimumAnswersRequiredToValidateACertification: 4,
    globalScoringConfiguration: [{ config: 'core2025' }],
    competencesScoringConfiguration: [{ config: 'core2025' }],
    challengesConfiguration: {
      maximumAssessmentLength: 4,
      challengesBetweenSameCompetence: 4,
      limitToOneQuestionPerTube: false,
      enablePassageByAllCompetences: true,
      variationPercent: 0.4,
      defaultCandidateCapacity: 4,
      defaultProbabilityToPickChallenge: 4,
    },
  };
  beforeEach(function () {
    [dataDroit2025, dataDroitCurrent, dataCore2024, dataCore2025].forEach(
      databaseBuilder.factory.buildCertificationVersion,
    );
    return databaseBuilder.commit();
  });

  describe('#getByFrameworkAndDate', function () {
    context('when framework is not recognized', function () {
      it('throws an error', async function () {
        const err = await catchErr(versionApi.getByFrameworkAndDate)({
          framework: 'CHOUBIDOUBIDOU',
          date: new Date('2026-05-05'),
        });

        expect(err.message).to.equal('Framework "CHOUBIDOUBIDOU" is not supported.');
      });
    });

    context('when framework is CLEA', function () {
      it('returns the corresponding CORE version', async function () {
        const res = await versionApi.getByFrameworkAndDate({
          framework: Frameworks.CLEA,
          date: new Date('2025-05-05'),
        });

        expect(res).to.deepEqualInstance(domainBuilder.certification.configuration.buildVersion.api(dataCore2025));
      });
    });

    context('when no version found for given reconciliationDate', function () {
      it('returns null', async function () {
        const res = await versionApi.getByFrameworkAndDate({
          framework: Frameworks.CORE,
          date: new Date('2023-01-01'),
        });

        expect(res).to.be.null;
      });
    });

    context('when version found for given reconciliationDate', function () {
      it('returns the corresponding version', async function () {
        const res = await versionApi.getByFrameworkAndDate({
          framework: Frameworks.DROIT,
          date: new Date('2025-06-06'),
        });

        expect(res).to.deepEqualInstance(domainBuilder.certification.configuration.buildVersion.api(dataDroit2025));
      });
    });
  });

  describe('#getById', function () {
    context('when version for given id does not exist', function () {
      it('returns null', async function () {
        const res = await versionApi.getById({
          id: 11111,
        });

        expect(res).to.be.null;
      });
    });

    context('when version for given id exists', function () {
      it('returns the version', async function () {
        const res = await versionApi.getById({
          id: dataDroitCurrent.id,
        });

        expect(res).to.deepEqualInstance(domainBuilder.certification.configuration.buildVersion.api(dataDroitCurrent));
      });
    });
  });
});
