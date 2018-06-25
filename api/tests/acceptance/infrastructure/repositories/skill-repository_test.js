const { expect, knex } = require('../../../test-helper');

const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');

describe('Acceptance | Infrastructure | Repositories | skill-repository', () => {

  describe('#save', () => {

    beforeEach(() => {
      return knex('assessments').insert([
        {
          id: 1,
          userId: null,
          courseId: 'rec'
        },
        {
          id: 2,
          userId: null,
          courseId: 'rec'
        },
        {
          id: 3,
          userId: null,
          courseId: 'rec'
        },
        {
          id: 4,
          userId: null,
          courseId: 'rec'
        }
      ]);
    });

    afterEach(() => {
      return knex('skills').delete()
        .then(() => knex('assessments').delete());
    });

    it('should save provided skills', () => {
      // given
      const formattedSkills = [
        { assessmentId: '1', name: '@url2', status: 'ok' },
        { assessmentId: '2', name: '@web3', status: 'ok' },
        { assessmentId: '3', name: '@recherch2', status: 'ko' },
        { assessmentId: '4', name: '@securite3', status: 'ko' },
      ];

      // when
      const promise = skillRepository.save(formattedSkills);

      // then
      return promise.then((createdSkills) => {
        expect(createdSkills[0].toJSON()).to.include(formattedSkills[0]);
        expect(createdSkills[1].toJSON()).to.include(formattedSkills[1]);
        expect(createdSkills[2].toJSON()).to.include(formattedSkills[2]);
        expect(createdSkills[3].toJSON()).to.include(formattedSkills[3]);
      });
    });
  });
});
