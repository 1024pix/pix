const { sinon } = require('../../../test-helper');
const Skill = require('../../../../lib/cat/skill');
const skillsService = require('../../../../lib/domain/services/skills-service');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');

describe('Unit | Service | Skills Service', () => {

  describe('#saveAssessmentSkills', () => {

    beforeEach(() => {
      sinon.stub(skillRepository, 'save').resolves();
    });

    afterEach(() => {
      skillRepository.save.restore();
    });

    it('should call Skills Repository#save with formatted skills', () => {

      const skillsFormatted = [
        { assessmentId: 'assessment_id', name: '@url2', status: 'ok' },
        { assessmentId: 'assessment_id', name: '@web3', status: 'ok' },
        { assessmentId: 'assessment_id', name: '@recherch2', status: 'ko' },
        { assessmentId: 'assessment_id', name: '@securite3', status: 'ko' },
      ];

      // when
      const promise = skillsService.saveAssessmentSkills('assessment_id', _generateValidatedSkills(), _generateFailedSkills());

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(skillRepository.save);
        sinon.assert.calledWith(skillRepository.save, skillsFormatted);
      });
    });
  });
});

function _generateValidatedSkills() {
  const url2 = new Skill('@url2');
  const web3 = new Skill('@web3');
  const skill = new Set();
  skill.add(url2);
  skill.add(web3);

  return skill;
}

function _generateFailedSkills() {
  const recherche2 = new Skill('@recherch2');
  const securite3 = new Skill('@securite3');
  const skill = new Set();
  skill.add(recherche2);
  skill.add(securite3);

  return skill;
}
