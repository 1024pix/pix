import { buildFramework } from '../../../../../db/database-builder/factory/learning-content/build-framework.js';
import { CampaignLearningContent } from '../../../../../src/shared/domain/models/CampaignLearningContent.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | CampaignLearningContent', function () {
  let framework;

  beforeEach(function () {
    framework = buildFramework({ id: 'frameworkId', name: 'someFramework' });
    const tube1 = domainBuilder.buildTube({
      id: 'tubeId',
      competenceId: 'competenceId1',
      skills: [
        domainBuilder.buildSkill({ id: 'skillId1', tubeId: 'tubeId1', name: '@skill2' }),
        domainBuilder.buildSkill({ id: 'skillId3', tubeId: 'tubeId1', name: '@skill1' }),
      ],
    });
    const tube2 = domainBuilder.buildTube({
      id: 'tubeId2',
      competenceId: 'competenceId2',
      skills: [
        domainBuilder.buildSkill({ id: 'idSkill2', tubeId: 'tubeId2', name: '@yep1' }),
        domainBuilder.buildSkill({ id: 'skillId4', tubeId: 'tubeId2', name: '@bouh1' }),
      ],
    });
    const area1 = domainBuilder.buildArea({ id: 'areaId', code: '5', frameworkId: framework.id });
    const area2 = domainBuilder.buildArea({ id: 'areaId', code: '2', frameworkId: framework.id });
    const competence1 = domainBuilder.buildCompetence({ id: 'competenceId1', index: '5.1', tubes: [tube1] });
    const competence2 = domainBuilder.buildCompetence({ id: 'competenceId2', index: '2.4', tubes: [tube2] });
    area1.competences = [competence1];
    area2.competences = [competence2];
    framework.areas = [area2, area1];
  });

  describe('building model', function () {
    it('should return competences sorted by index', function () {
      const learningContent = domainBuilder.buildLearningContent([framework]);
      const campaignLearningContent = new CampaignLearningContent(learningContent.frameworks);
      expect(campaignLearningContent.competences.map((competence) => competence.index)).to.deep.equal(['2.4', '5.1']);
    });

    it('should return areas sorted by code', function () {
      const learningContent = domainBuilder.buildLearningContent([framework]);
      const campaignLearningContent = new CampaignLearningContent(learningContent.frameworks);
      expect(campaignLearningContent.areas.map((area) => area.code)).to.deep.equal(['2', '5']);
    });

    it('should return skills sorted by competence then by skill name', function () {
      const learningContent = domainBuilder.buildLearningContent([framework]);
      const campaignLearningContent = new CampaignLearningContent(learningContent.frameworks);
      expect(campaignLearningContent.skills.map((skill) => skill.name)).to.deep.equal([
        '@bouh1',
        '@yep1',
        '@skill1',
        '@skill2',
      ]);
    });
  });
});
