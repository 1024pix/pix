import { expect } from 'chai';

import { buildArea } from '../../../../../db/database-builder/factory/learning-content/build-area.js';
import { buildCompetence } from '../../../../../db/database-builder/factory/learning-content/build-competence.js';
import { buildFramework } from '../../../../../db/database-builder/factory/learning-content/build-framework.js';
import { buildSkill } from '../../../../../db/database-builder/factory/learning-content/build-skill.js';
import { buildTube } from '../../../../../db/database-builder/factory/learning-content/build-tube.js';
import { CampaignLearningContent } from '../../../../../src/shared/domain/models/CampaignLearningContent.js';
import { domainBuilder } from '../../../../test-helper.js';

describe('Unit | Domain | Models | CampaignLearningContent', function () {
  let framework;

  beforeEach(function () {
    framework = buildFramework({ id: 'frameworkId', name: 'someFramework' });
    const skill = buildSkill({ id: 'skillId', tubeId: 'tubeId' });
    const tube = buildTube({ id: 'tubeId', competenceId: 'competenceId', skills: [skill] });
    const area1 = buildArea({ id: 'areaId', code: '5', frameworkId: framework.id });
    const area2 = buildArea({ id: 'areaId', code: '2', frameworkId: framework.id });
    const competence1 = buildCompetence({ id: 'competenceId', index: '5.1', tubes: [tube] });
    const competence2 = buildCompetence({ id: 'competenceId', index: '2.4', tubes: [tube] });
    area1.competences = [competence1];
    area2.competences = [competence2];
    framework.areas = [area2, area1];
  });

  describe('building model', function () {
    it('should return competences sorted by index', function () {
      const learningContent = domainBuilder.buildLearningContent([framework]);
      const campaignLearningContent = new CampaignLearningContent(learningContent.frameworks);
      expect(campaignLearningContent.competences).to.deep.equal(
        learningContent.competences.sort((a, b) => a.index.localeCompare(b.index)),
      );
    });

    it('should return areas sorted by code', function () {
      const learningContent = domainBuilder.buildLearningContent([framework]);
      const campaignLearningContent = new CampaignLearningContent(learningContent.frameworks);
      expect(campaignLearningContent.areas).to.deep.equal(
        learningContent.areas.sort((a, b) => a.code.localeCompare(b.code)),
      );
    });
  });
});
