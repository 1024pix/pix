import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Domain | UseCases | get-campaign-parameters-for-simulator', function () {
  describe('when the campaign does not exist', function () {
    it('should return show a not found error', async function () {
      expect(
        evaluationUsecases.getCampaignParametersForSimulator({
          campaignId: 666,
          locale: 'fr',
        }),
      ).to.eventually.throw(NotFoundError);
    });
  });

  describe('when the campaign do exists', function () {
    it('should return skills and challenges', async function () {
      // given
      const campaignId = 100000;
      const skillData0 = {
        id: 'skillId0Perime',
        status: 'périmé',
      };
      const skillData1 = {
        id: 'skillId1Archive',
        status: 'archivé',
      };
      const skillData2 = {
        id: 'skillId2Actif',
        status: 'actif',
      };
      databaseBuilder.factory.learningContent.buildSkill(skillData0);
      const skill1DB = databaseBuilder.factory.learningContent.buildSkill(skillData1);
      const skill2DB = databaseBuilder.factory.learningContent.buildSkill(skillData2);
      databaseBuilder.factory.buildCampaign({ id: campaignId });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skillData0.id });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skillData1.id });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skillData2.id });
      await databaseBuilder.commit();

      // when
      const result = await evaluationUsecases.getCampaignParametersForSimulator({
        campaignId,
        locale: 'fr',
      });

      // then
      expect(result).to.deep.equal({
        skills: [
          domainBuilder.buildSkill({
            ...skill1DB,
            difficulty: skill1DB.level,
            hint: skill1DB.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skill2DB,
            difficulty: skill2DB.level,
            hint: skill2DB.hint_i18n.fr,
          }),
        ],
        challenges: [],
        competences: [],
      });
    });

    it('should return the competences covered by the campaign skills, ordered by index', async function () {
      // given
      const campaignId = 100001;
      databaseBuilder.factory.learningContent.buildArea({ id: 'areaId1', color: 'jaffa' });
      databaseBuilder.factory.learningContent.buildArea({ id: 'areaId2', color: 'emerald' });
      databaseBuilder.factory.learningContent.buildCompetence({
        id: 'competenceId21',
        index: '21.1',
        name_i18n: { fr: 'Pix+Édu - Communiquer' },
        areaId: 'areaId1',
      });
      databaseBuilder.factory.learningContent.buildCompetence({
        id: 'competenceId2',
        index: '2.4',
        name_i18n: { fr: 'S’insérer dans le monde numérique' },
        areaId: 'areaId2',
      });
      databaseBuilder.factory.learningContent.buildSkill({
        id: 'skillIdPixEdu',
        status: 'actif',
        competenceId: 'competenceId21',
      });
      databaseBuilder.factory.learningContent.buildSkill({
        id: 'skillIdPix',
        status: 'actif',
        competenceId: 'competenceId2',
      });
      databaseBuilder.factory.buildCampaign({ id: campaignId });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skillIdPixEdu' });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skillIdPix' });
      await databaseBuilder.commit();

      // when
      const { competences } = await evaluationUsecases.getCampaignParametersForSimulator({
        campaignId,
        locale: 'fr',
      });

      // then
      expect(competences).to.deep.equal([
        {
          id: 'competenceId2',
          index: '2.4',
          name: 'S’insérer dans le monde numérique',
          areaColor: 'emerald',
        },
        {
          id: 'competenceId21',
          index: '21.1',
          name: 'Pix+Édu - Communiquer',
          areaColor: 'jaffa',
        },
      ]);
    });
  });
});
