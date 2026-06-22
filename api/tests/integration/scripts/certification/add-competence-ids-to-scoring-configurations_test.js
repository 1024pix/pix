import sinon from 'sinon';

import { AddCompetenceIdsToScoringConfigurations } from '../../../../scripts/certification/add-competence-ids-to-scoring-configurations.js';
import { PIX_ORIGIN } from '../../../../src/shared/domain/constants.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | Scripts | Certification | add-competence-ids-to-scoring-configurations', function () {
  let script;
  let logger;

  const competence11 = {
    id: 'recCompetence11',
    index: '1.1',
    origin: PIX_ORIGIN,
    name_i18n: { fr: 'Compétence 1.1' },
    description_i18n: { fr: 'Description 1.1' },
    areaId: 'recArea1',
    skillIds: [],
    thematicIds: [],
  };

  const competence12 = {
    id: 'recCompetence12',
    index: '1.2',
    origin: PIX_ORIGIN,
    name_i18n: { fr: 'Compétence 1.2' },
    description_i18n: { fr: 'Description 1.2' },
    areaId: 'recArea1',
    skillIds: [],
    thematicIds: [],
  };

  beforeEach(function () {
    script = new AddCompetenceIdsToScoringConfigurations();
    logger = { info: sinon.stub(), warn: sinon.stub() };
  });

  describe('#handle', function () {
    context('when dryRun is false', function () {
      it('should add competenceId to each entry in competencesScoringConfiguration', async function () {
        // given
        databaseBuilder.factory.learningContent.build({
          competences: [competence11, competence12],
        });

        const scoringConfig = [
          {
            competence: '1.1',
            values: [{ bounds: { min: -10, max: 0 }, competenceLevel: 0 }],
          },
          {
            competence: '1.2',
            values: [{ bounds: { min: 0, max: 10 }, competenceLevel: 1 }],
          },
        ];
        const { id } = databaseBuilder.factory.buildCertificationVersion({
          competencesScoringConfiguration: scoringConfig,
        });

        const invalidVersion = databaseBuilder.factory.buildCertificationVersion({
          competencesScoringConfiguration: [],
        });
        // competencesScoringConfiguration is overwritten as to simulate a null vale
        invalidVersion.competencesScoringConfiguration = null;

        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: false } });

        // then
        const { competencesScoringConfiguration } = await knex('certification_versions').where({ id }).first();
        expect(competencesScoringConfiguration).to.deep.equal([
          {
            competence: '1.1',
            competenceId: 'recCompetence11',
            values: [{ bounds: { min: -10, max: 0 }, competenceLevel: 0 }],
          },
          {
            competence: '1.2',
            competenceId: 'recCompetence12',
            values: [{ bounds: { min: 0, max: 10 }, competenceLevel: 1 }],
          },
        ]);
      });
    });

    context('when dryRun is true', function () {
      it('should not modify the database', async function () {
        // given
        databaseBuilder.factory.learningContent.build({ competences: [competence11] });

        const scoringConfig = [{ competence: '1.1', values: [] }];
        const { id } = databaseBuilder.factory.buildCertificationVersion({
          competencesScoringConfiguration: scoringConfig,
        });
        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: true } });

        // then
        const { competencesScoringConfiguration } = await knex('certification_versions').where({ id }).first();
        expect(competencesScoringConfiguration).to.deep.equal(scoringConfig);
      });
    });

    context('when a competence index is not found in the learning content', function () {
      it('should log a warning and leave the entry without competenceId', async function () {
        // given
        databaseBuilder.factory.learningContent.build({ competences: [competence11] });

        const scoringConfig = [{ competence: '9.9', values: [] }];
        const { id } = databaseBuilder.factory.buildCertificationVersion({
          competencesScoringConfiguration: scoringConfig,
        });
        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: false } });

        // then
        expect(logger.warn).to.have.been.calledOnce;
        const { competencesScoringConfiguration } = await knex('certification_versions').where({ id }).first();
        expect(competencesScoringConfiguration[0]).not.to.have.property('competenceId');
      });
    });
  });
});
