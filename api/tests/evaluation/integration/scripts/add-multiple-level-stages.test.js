import * as url from 'node:url';

import sinon from 'sinon';

import { AddMultipleLevelStagesScript } from '../../../../src/evaluation/scripts/add-multiple-level-stages.js';

import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../tooling/learning-content-builder/index.js';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Evaluation | Scripts | add-multiple-level-stages-script', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new AddMultipleLevelStagesScript();

      const { options } = script.metaInfo;
      expect(options.file).to.deep.include({
        type: 'string',
        describe: 'CSV File containing multiple stages to add',
        demandOption: true,
      });
    });

    it('parses CSV data correctly', async function () {
      const testCsvFile = `${currentDirectory}files/stages-test.csv`;

      const script = new AddMultipleLevelStagesScript();

      const { options } = script.metaInfo;
      const parsedData = await options.file.coerce(testCsvFile);
      expect(parsedData).to.be.an('array').that.deep.includes({
        targetProfileId: 1,
        level: 0,
        title: 'Parcours presque terminé !',
        message: 'presque Bravo',
      });
      expect(parsedData).to.be.an('array').that.deep.includes({
        targetProfileId: 1,
        level: 1,
        title: 'Parcours terminé !',
        message: 'Bravo',
      });
    });
  });

  describe('#handle', function () {
    const now = new Date();
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('should insert stages', async function () {
      // given
      const learningContent = [
        {
          id: 'recArea0',
          code: 'area0',
          competences: [
            {
              id: 'recCompetence0',
              index: '1.1',
              tubes: [
                {
                  id: 'recTube0_0',
                  skills: [
                    {
                      id: 'recSkill1_0',
                      nom: '@recSkill1_0',
                      challenges: [{ id: 'recChallenge1_0_0' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      databaseBuilder.factory.learningContent.build(learningContentObjects);

      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'recTube0_0', targetProfileId: targetProfile.id });

      await databaseBuilder.commit();

      const stagesToCreate = [
        {
          targetProfileId: targetProfile.id,
          level: 0,
          title: 'Parcours presque terminé !',
          message: 'presque Bravo',
        },
        {
          targetProfileId: targetProfile.id,
          level: 1,
          title: 'Parcours terminé !',
          message: 'Bravo',
        },
      ];

      const loggerStub = { info: sinon.stub() };

      // when
      const script = new AddMultipleLevelStagesScript();
      await script.handle({ options: { file: stagesToCreate }, logger: loggerStub });

      // then
      const stages = await knex('stages').select('*').where('targetProfileId', targetProfile.id);
      expect(stages).to.have.length(2);
      expect(stages[0].title).to.equal('Parcours presque terminé !');
      expect(stages[0].message).to.equal('presque Bravo');
      expect(stages[0].level).to.equal(0);
      expect(stages[0].prescriberTitle).to.equal('Parcours presque terminé !');
      expect(stages[0].prescriberDescription).to.equal('presque Bravo');

      expect(stages[1].title).to.equal('Parcours terminé !');
      expect(stages[1].message).to.equal('Bravo');
      expect(stages[1].level).to.equal(1);
      expect(stages[1].prescriberTitle).to.equal('Parcours terminé !');
      expect(stages[1].prescriberDescription).to.equal('Bravo');
    });
  });
});
