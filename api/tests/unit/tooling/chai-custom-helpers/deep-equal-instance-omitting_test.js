import { expect, domainBuilder } from '../../../test-helper';

describe('Unit | chai-custom-helpers | deepEqualInstanceOmitting', function () {
  it('should fail assertion when both objects are not of the same instance', function () {
    // given
    const answer = domainBuilder.buildAnswer();
    const campaign = domainBuilder.buildCampaign();
    const answerDTO = { ...answer };

    // when / then
    global.chaiErr(function () {
      expect(campaign).to.deepEqualInstanceOmitting(answer);
    }, "expected 'Campaign' to equal 'Answer'");
    global.chaiErr(function () {
      expect(answerDTO).to.deepEqualInstanceOmitting(answer);
    }, "expected 'Object' to equal 'Answer'");
  });

  it('should fail assertion when both objects have not the same content', function () {
    // given
    const skillSet = domainBuilder.buildSkillSet({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const otherSkillSet = domainBuilder.buildSkillSet({
      id: 124,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const anotherSkillSet = domainBuilder.buildSkillSet({
      id: 123,
      name: 'name',
      skillIds: ['recUVW', 'recXYZ'],
    });

    // when/then
    global.chaiErr(
      function () {
        expect(otherSkillSet).to.deepEqualInstanceOmitting(skillSet);
      },
      {
        actual: otherSkillSet,
        expected: skillSet,
        operator: 'deepStrictEqual',
      }
    );
    global.chaiErr(
      function () {
        expect(anotherSkillSet).to.deepEqualInstanceOmitting(skillSet);
      },
      {
        actual: anotherSkillSet,
        expected: skillSet,
        operator: 'deepStrictEqual',
      }
    );
  });

  it('should succeed assertion when both objects have the same type and content, regardless of the reference', function () {
    // given
    const skillSet = domainBuilder.buildSkillSet({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const sameSkillSet = domainBuilder.buildSkillSet({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });

    // then
    expect(skillSet).to.deepEqualInstanceOmitting(skillSet);
    expect(skillSet).to.deepEqualInstanceOmitting(sameSkillSet);
  });

  it('should succeed assertion when both objects have the same type and partial content', function () {
    // given
    const skillSet = domainBuilder.buildSkillSet({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const skillSetDifferentId = domainBuilder.buildSkillSet({
      id: 456,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });

    // then
    expect(skillSet).to.deepEqualInstanceOmitting(skillSetDifferentId, ['id']);
  });
});
