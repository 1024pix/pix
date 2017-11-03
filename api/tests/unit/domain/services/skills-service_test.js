const { describe, it, expect, beforeEach, afterEach, sinon } = require('../../../test-helper');
const Skill = require('../../../../lib/cat/skill');
const skillsService = require('../../../../lib/domain/services/skills-service');
const skillsRepository = require('../../../../lib/infrastructure/repositories/skill-repository');

describe('Unit | Service | Skills Service', () => {

  describe('#saveAssessmentSkills', () => {

    beforeEach(() => {
      sinon.stub(skillsRepository.db, 'save').resolves();
    });

    afterEach(() => {
      skillsRepository.db.save.restore();
    });

    it('should call Skills Repository#save with formatted skills', () => {

      const givenSkills = {
        assessmentId: 'assessment_id',
        validatedSkills: _generateValitedSkills(),
        failedSkills: _generateFailedSkills()
      };

      const skillsFormatted = [
        { assessmentId: 'assessment_id', name: '@url2', status: 'ok' },
        { assessmentId: 'assessment_id', name: '@web3', status: 'ok' },
        { assessmentId: 'assessment_id', name: '@recherch2', status: 'ko' },
        { assessmentId: 'assessment_id', name: '@securite3', status: 'ko' },
      ];

      // when
      const promise = skillsService.saveAssessmentSkills(givenSkills);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(skillsRepository.db.save);
        sinon.assert.calledWith(skillsRepository.db.save, skillsFormatted);
      });
    });

    it('should return null, when skills is undefined', () => {
      // when
      const promise = skillsService.saveAssessmentSkills();

      // then
      return promise.then((res) => {
        expect(res).to.equal(null);
      });
    });
  });
});

function _generateValitedSkills() {
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
