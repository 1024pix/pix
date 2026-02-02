import { knex } from '../../../../../../db/knex-database-connection.js';
import { V3CertificationScoring } from '../../../../../../src/certification/shared/domain/models/V3CertificationScoring.js';
import {
  getLatestByDateAndLocale,
  getLatestByVersion,
  getLatestByVersionAndLocale,
  saveCertificationScoringConfiguration,
  saveCompetenceForScoringConfiguration,
} from '../../../../../../src/certification/shared/infrastructure/repositories/scoring-configuration-repository.js';
import { PIX_ORIGIN } from '../../../../../../src/shared/domain/constants.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | scoring-configuration-repository', function () {
  describe('#getLatestByDateAndLocale', function () {
    beforeEach(async function () {
      const secondCompetenceScoringConfiguration = [
        {
          competence: '1.1',
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
      expect(result._competencesForScoring[0].competenceId).to.be.equal(`${PIX_ORIGIN}Competence`);
      expect(result._competencesForScoring[0].intervals.length).not.to.be.equal(0);
      expect(result._certificationScoringConfiguration[0].bounds.min).to.be.equal(-8);
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

      const version = domainBuilder.certification.shared.buildVersion({
        id: 1,
      });

      databaseBuilder.factory.buildCertificationVersion({
        id: 1,
      });

      databaseBuilder.factory.buildCertificationVersion({
        id: 2,
      });

      await databaseBuilder.commit();

      // when
      const result = await getLatestByVersion({ version });

      // then
      expect(result).to.be.instanceOf(V3CertificationScoring);
      expect(result._competencesForScoring[0].competenceId).to.be.equal(`${PIX_ORIGIN}Competence`);
      expect(result._competencesForScoring[0].intervals.length).not.to.be.equal(0);
    });
  });

  describe('#getLatestByVersionAndLocale', function () {
    it('should return a list of Pix Origin competences for scoring', async function () {
      // given
      // Competences exist in multiple frameworks with the same index
      // Here, we need to get only competences that are part of the PIX_ORIGIN framework
      const competenceIndex = '1.1';
      buildFramework({ competenceIndex, origin: 'external' });
      buildFramework({ competenceIndex, origin: PIX_ORIGIN });

      const version = domainBuilder.certification.shared.buildVersion({
        id: 1,
      });

      databaseBuilder.factory.buildCertificationVersion({
        id: 1,
      });

      databaseBuilder.factory.buildCertificationVersion({
        id: 2,
      });

      await databaseBuilder.commit();

      // when
      const result = await getLatestByVersionAndLocale({ locale: 'fr-fr', version });

      // then
      expect(result).to.be.instanceOf(V3CertificationScoring);
      expect(result._competencesForScoring[0].competenceId).to.be.equal(`${PIX_ORIGIN}Competence`);
      expect(result._competencesForScoring[0].intervals.length).not.to.be.equal(0);
    });
  });

  describe('#saveCompetenceForScoringConfiguration', function () {
    it('should update latest configuration with new competence scoring', async function () {
      // given
      const configToBeUpdatedId = databaseBuilder.factory.buildCertificationVersion({
        competencesScoringConfiguration: null,
        expirationDate: null,
      }).id;
      const competencesConfigUntouched = { untouched: 'data' };
      const configUntouchedId = databaseBuilder.factory.buildCertificationVersion({
        competencesScoringConfiguration: competencesConfigUntouched,
        expirationDate: new Date(),
      }).id;
      await databaseBuilder.commit();

      const newCompetencesScoringConfig = { some: 'data' };

      // when
      await saveCompetenceForScoringConfiguration({ configuration: newCompetencesScoringConfig });

      // then
      const updatedConfiguration = await knex('certification_versions').where({ id: configToBeUpdatedId }).first();
      expect(updatedConfiguration.competencesScoringConfiguration).to.deep.equal(newCompetencesScoringConfig);

      const configurationUntouched = await knex('certification_versions').where({ id: configUntouchedId }).first();
      expect(configurationUntouched.competencesScoringConfiguration).to.deep.equal(competencesConfigUntouched);
    });
  });

  describe('#saveCertificationScoringConfiguration', function () {
    it('should update latest configuration with new global scoring configuration', async function () {
      // given
      const configToBeUpdatedId = databaseBuilder.factory.buildCertificationVersion({
        globalScoringConfiguration: null,
        expirationDate: null,
      }).id;
      const globalScoringConfigUntouched = { untouched: 'data' };
      const configUntouchedId = databaseBuilder.factory.buildCertificationVersion({
        globalScoringConfiguration: globalScoringConfigUntouched,
        expirationDate: new Date(),
      }).id;
      await databaseBuilder.commit();

      const newGlobalScoringConfig = { some: 'data' };

      // when
      await saveCertificationScoringConfiguration({ configuration: newGlobalScoringConfig });

      // then
      const updatedConfiguration = await knex('certification_versions').where({ id: configToBeUpdatedId }).first();
      expect(updatedConfiguration.globalScoringConfiguration).to.deep.equal(newGlobalScoringConfig);

      const configurationUntouched = await knex('certification_versions').where({ id: configUntouchedId }).first();
      expect(configurationUntouched.globalScoringConfiguration).to.deep.equal(globalScoringConfigUntouched);
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
