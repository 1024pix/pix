import * as smartRandomSkillRepository from '../../../../../src/evaluation/infrastructure/repositories/smart-random-skill-repository.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../test-helper.js';

describe('Evaluation | Integration | Infrastructure| Repository | smart-random-skill-repository', function () {
  describe('#findActiveByCompetenceId', function () {
    context('when no skills match the constraints', function () {
      it('returns an empty array', async function () {
        const someSkillData = {
          id: 'skillA',
          competenceId: 'competenceA',
        };
        databaseBuilder.factory.learningContent.build(
          {
            skills: [someSkillData],
          },
          { noDefaultValues: true },
        );
        await databaseBuilder.commit();

        const smartRandomSkills = await smartRandomSkillRepository.findActiveByCompetenceId('competenceB');

        expect(smartRandomSkills).to.deep.equal([]);
      });
    });

    context('when some skills match the constraints', function () {
      it('returns the smart random skills ordered by id', async function () {
        const notMatchingSkillData = {
          id: 'skillNotMatching',
          competenceId: 'competenceA',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ARCHIVED,
        };
        const rightCompetenceWrongStatusData = {
          id: 'rightCompetenceWrongStatusData',
          competenceId: 'competenceOK',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ARCHIVED,
        };
        const rightStatusWrongCompetenceData = {
          id: 'rightStatusWrongCompetenceData',
          competenceId: 'competenceNONO',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ACTIVE,
        };
        const matchingSkill1 = {
          id: 'skillZ',
          name: '@coucou1',
          level: 1,
          competenceId: 'competenceOK',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ACTIVE,
        };
        const matchingSkill2 = {
          id: 'skillA',
          name: '@fruits5',
          level: 5,
          competenceId: 'competenceOK',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ACTIVE,
        };
        databaseBuilder.factory.learningContent.build(
          {
            skills: [
              notMatchingSkillData,
              rightCompetenceWrongStatusData,
              rightStatusWrongCompetenceData,
              matchingSkill1,
              matchingSkill2,
            ],
          },
          { noDefaultValues: true },
        );
        await databaseBuilder.commit();

        const smartRandomSkills = await smartRandomSkillRepository.findActiveByCompetenceId('competenceOK');

        expect(smartRandomSkills).to.deepEqualArray([
          domainBuilder.evaluation.buildSmartRandomSkill({
            ...matchingSkill2,
            difficulty: matchingSkill2.level,
          }),
          domainBuilder.evaluation.buildSmartRandomSkill({
            ...matchingSkill1,
            difficulty: matchingSkill1.level,
          }),
        ]);
      });
    });
  });
});
