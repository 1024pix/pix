import { V3CertificationScoring } from '../../../../../../src/certification/evaluation/domain/models/V3CertificationScoring.js';
import {
  getLatestByDateAndLocale,
  getLatestByVersion,
} from '../../../../../../src/certification/evaluation/infrastructure/repositories/scoring-configuration-repository.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { PIX_ORIGIN } from '../../../../../../src/shared/constants.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Evaluation | Integration | Repositories | scoring-configuration-repository', function () {
  describe('#getLatestByDateAndLocale', function () {
    beforeEach(async function () {
      const secondCompetenceScoringConfiguration = [
        {
          competence: '1.1',
          competenceId: `${PIX_ORIGIN}Competence`,
          values: [
            {
              bounds: {
                max: -4,
                min: -6,
              },
              competenceLevel: 1,
            },
          ],
        },
      ];

      const firstConfigurationDate = new Date('2019-01-01T08:00:00Z');
      const secondConfigurationDate = new Date('2020-01-01T08:00:00Z');
      const thirdConfigurationDate = new Date('2021-01-01T08:00:00Z');

      // Competences exist in multiple frameworks with the same index
      // Here, we need to get only competences that are part of the PIX_ORIGIN framework
      const competenceIndex = '1.1';
      buildFramework({ competenceIndex, origin: 'external' });
      buildFramework({ competenceIndex, origin: PIX_ORIGIN });

      databaseBuilder.factory.buildCertificationVersion({
        startDate: firstConfigurationDate,
        expirationDate: secondConfigurationDate,
        globalScoringConfiguration: null,
      });

      databaseBuilder.factory.buildCertificationVersion({
        startDate: secondConfigurationDate,
        expirationDate: thirdConfigurationDate,
        competencesScoringConfiguration: secondCompetenceScoringConfiguration,
      });

      databaseBuilder.factory.buildCertificationVersion({
        startDate: thirdConfigurationDate,
        expirationDate: null,
      });

      await databaseBuilder.commit();
    });

    describe('when the date is before the scoring configurations', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const date = new Date('2018-06-01T08:00:00Z');

        // when
        const error = await catchErr(getLatestByDateAndLocale)({ locale: 'fr-fr', date });

        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal(`No certification scoring configuration found for date ${date.toISOString()}`);
      });
    });

    describe('when the configuration is missing a scoring value', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const date = new Date('2019-04-12T08:00:00Z');

        // when
        const error = await catchErr(getLatestByDateAndLocale)({ locale: 'fr-fr', date });

        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal(`No certification scoring configuration found for date ${date.toISOString()}`);
      });
    });

    it('should return a list of Pix Origin competences for scoring', async function () {
      // given
      const date = new Date('2020-07-01T08:00:00Z');

      // when
      const result = await getLatestByDateAndLocale({ locale: 'fr-fr', date });

      // then
      expect(result).to.be.instanceOf(V3CertificationScoring);
      expect(result.versionId).to.be.a('number');
      expect(result._competencesForScoring[0].competenceId).to.be.equal(`${PIX_ORIGIN}Competence`);
      expect(result._competencesForScoring[0].intervals.length).not.to.be.equal(0);
      expect(result._certificationScoringConfiguration[0].bounds.min).to.be.equal(-4.6);
      expect(result._certificationScoringConfiguration[7].bounds.max).to.be.equal(8);
    });
  });

  describe('#getLatestByVersion', function () {
    it('should return a list of Pix Origin competences for scoring', async function () {
      // given
      // Competences exist in multiple frameworks with the same index
      // Here, we need to get only competences that are part of the PIX_ORIGIN framework
      const competenceIndex = '1.1';
      buildFramework({ competenceIndex, origin: 'external' });
      buildFramework({ competenceIndex, origin: PIX_ORIGIN });

      const version = domainBuilder.certification.configuration.buildVersion({
        id: 1,
        competencesScoringConfiguration: [
          {
            values: [{ bounds: { max: -1, min: -4 }, competenceLevel: 0 }],
            competence: competenceIndex,
            competenceId: `${PIX_ORIGIN}Competence`,
          },
        ],
        scope: Frameworks.CORE,
      });
      await databaseBuilder.commit();

      // when
      const result = await getLatestByVersion({ version });

      // then
      expect(result).to.be.instanceOf(V3CertificationScoring);
      expect(result.versionId).to.equal(1);
      expect(result._competencesForScoring[0].competenceId).to.equal(`${PIX_ORIGIN}Competence`);
      expect(result._competencesForScoring[0].intervals.length).to.equal(1);
    });
  });
});

function buildFramework({ competenceIndex, origin }) {
  const framework = databaseBuilder.factory.learningContent.buildFramework({
    id: `${origin}FrameworkId`,
    name: `${origin}Framework`,
  });
  const competence = databaseBuilder.factory.learningContent.buildCompetence({
    id: `${origin}Competence`,
    index: competenceIndex,
    areaId: `${origin}Area`,
    origin,
  });
  databaseBuilder.factory.learningContent.buildArea({
    id: `${origin}Area`,
    frameworkId: framework.id,
    code: '1',
    competenceIds: [competence.id],
  });
}
