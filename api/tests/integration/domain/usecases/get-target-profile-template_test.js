const getTargetProfileTemplate = require('../../../../lib/domain/usecases/get-target-profile-template');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const { expect, knex, databaseBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const TargetProfileTemplateTube = require('../../../../lib/domain/models/TargetProfileTemplateTube');

describe('Integration | UseCases | get-target-profile-template', function () {
  let targetProfileTemplate, tube1, tube2;
  const ID_NOT_EXIST = '-1';

  beforeEach(async function () {
    targetProfileTemplate = databaseBuilder.factory.buildTargetProfileTemplate({
      id: 1,
    });

    tube1 = databaseBuilder.factory.buildTargetProfileTemplateTube({
      id: 2,
      targetProfileTemplateId: 1,
      tubeId: 'tubeId1',
      level: 8,
    });
    tube2 = databaseBuilder.factory.buildTargetProfileTemplateTube({
      id: 3,
      targetProfileTemplateId: 1,
      tubeId: 'tubeId2',
      level: 7,
    });

    await databaseBuilder.commit();
  });

  afterEach(async function () {
    await knex('target-profile-templates_tubes').delete();
    await knex('target-profile-templates').delete();
  });

  it('should return a target profile template', async function () {
    // given
    const tube1Expected = new TargetProfileTemplateTube({
      id: tube1.tubeId,
      level: tube1.level,
    });
    const tube2Expected = new TargetProfileTemplateTube({
      id: tube2.tubeId,
      level: tube2.level,
    });

    // when
    const targetProfileTemplateResult = await getTargetProfileTemplate({
      targetProfileTemplateId: targetProfileTemplate.id,
      targetProfileRepository,
    });

    // then
    expect(targetProfileTemplateResult).to.exist;
    expect(targetProfileTemplateResult.tubes).to.deepEqualArray([tube1Expected, tube2Expected]);
  });

  it('should return an exception because the target profile template does not exist', async function () {
    // when
    const error = await catchErr(getTargetProfileTemplate)({
      targetProfileTemplateId: ID_NOT_EXIST,
      targetProfileRepository,
    });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
    expect(error.message).to.equal('No target profile template for ID -1');
  });
});
