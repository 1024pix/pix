import { expect, sinon, catchErr } from '../../../test-helper.js';
import { EntityValidationError } from '../../../../lib/domain/errors.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';

const { updateTargetProfile } = usecases;

describe('Unit | UseCase | update-target-profile', function () {
  let targetProfileForUpdateRepository = null;

  beforeEach(function () {
    targetProfileForUpdateRepository = {
      update: sinon.stub(),
    };
  });

  it('should throw error when name is null', async function () {
    // when
    const error = await catchErr(updateTargetProfile)({
      id: 123,
      name: null,
      imageUrl: 'mon image',
      description: 'description changée',
      comment: 'commentaire changé',
      category: 'OTHER',
      targetProfileForUpdateRepository,
    });

    expect(error).to.be.an.instanceOf(EntityValidationError);
    expect(error.invalidAttributes[0].attribute).to.eq('name');
    expect(error.invalidAttributes[0].message).to.eq('NAME_IS_REQUIRED');
    expect(targetProfileForUpdateRepository.update).to.not.have.been.called;
  });
  it('should throw error when name is undefined', async function () {
    // when
    const error = await catchErr(updateTargetProfile)({
      id: 123,
      imageUrl: 'mon image',
      description: 'description changée',
      comment: 'commentaire changé',
      category: 'OTHER',
      targetProfileForUpdateRepository,
    });

    expect(error).to.be.an.instanceOf(EntityValidationError);
    expect(error.invalidAttributes[0].attribute).to.eq('name');
    expect(error.invalidAttributes[0].message).to.eq('NAME_IS_REQUIRED');
    expect(targetProfileForUpdateRepository.update).to.not.have.been.called;
  });
  it('should throw error when name is empty', async function () {
    // when
    const error = await catchErr(updateTargetProfile)({
      id: 123,
      name: '',
      imageUrl: 'mon image',
      description: 'description changée',
      comment: 'commentaire changé',
      category: 'OTHER',
      targetProfileForUpdateRepository,
    });

    expect(error).to.be.an.instanceOf(EntityValidationError);
    expect(error.invalidAttributes[0].attribute).to.eq('name');
    expect(error.invalidAttributes[0].message).to.eq('NAME_IS_REQUIRED');
    expect(targetProfileForUpdateRepository.update).to.not.have.been.called;
  });
  it('should throw error when category is null', async function () {
    // when
    const error = await catchErr(updateTargetProfile)({
      id: 123,
      name: 'name',
      imageUrl: 'mon image',
      description: 'description changée',
      comment: 'commentaire changé',
      category: null,
      targetProfileForUpdateRepository,
    });

    expect(error).to.be.an.instanceOf(EntityValidationError);
    expect(error.invalidAttributes[0].attribute).to.eq('category');
    expect(error.invalidAttributes[0].message).to.eq('CATEGORY_IS_REQUIRED');
    expect(targetProfileForUpdateRepository.update).to.not.have.been.called;
  });
  it('should throw error when category is undefined', async function () {
    // when
    const error = await catchErr(updateTargetProfile)({
      id: 123,
      name: 'name',
      imageUrl: 'mon image',
      description: 'description changée',
      comment: 'commentaire changé',
      targetProfileForUpdateRepository,
    });

    expect(error).to.be.an.instanceOf(EntityValidationError);
    expect(error.invalidAttributes[0].attribute).to.eq('category');
    expect(error.invalidAttributes[0].message).to.eq('CATEGORY_IS_REQUIRED');
    expect(targetProfileForUpdateRepository.update).to.not.have.been.called;
  });
  it('should throw error when category is empty', async function () {
    // when
    const error = await catchErr(updateTargetProfile)({
      id: 123,
      name: 'name',
      imageUrl: 'mon image',
      description: 'description changée',
      comment: 'commentaire changé',
      category: '',
      targetProfileForUpdateRepository,
    });

    expect(error).to.be.an.instanceOf(EntityValidationError);
    expect(error.invalidAttributes[0].attribute).to.eq('category');
    expect(error.invalidAttributes[0].message).to.eq('CATEGORY_IS_REQUIRED');
    expect(targetProfileForUpdateRepository.update).to.not.have.been.called;
  });
  it('should throw error when imageUrl is null', async function () {
    // when
    const error = await catchErr(updateTargetProfile)({
      id: 123,
      name: 'name',
      imageUrl: null,
      description: 'description changée',
      comment: 'commentaire changé',
      category: 'OTHER',
      targetProfileForUpdateRepository,
    });

    expect(error).to.be.an.instanceOf(EntityValidationError);
    expect(error.invalidAttributes[0].attribute).to.eq('imageUrl');
    expect(error.invalidAttributes[0].message).to.eq('IMAGE_URL_IS_REQUIRED');
    expect(targetProfileForUpdateRepository.update).to.not.have.been.called;
  });
  it('should throw error when imageUrl is undefined', async function () {
    // when
    const error = await catchErr(updateTargetProfile)({
      id: 123,
      name: 'name',
      description: 'description changée',
      comment: 'commentaire changé',
      category: 'OTHER',
      targetProfileForUpdateRepository,
    });

    expect(error).to.be.an.instanceOf(EntityValidationError);
    expect(error.invalidAttributes[0].attribute).to.eq('imageUrl');
    expect(error.invalidAttributes[0].message).to.eq('IMAGE_URL_IS_REQUIRED');
    expect(targetProfileForUpdateRepository.update).to.not.have.been.called;
  });
  it('should throw error when imageUrl is empty', async function () {
    // when
    const error = await catchErr(updateTargetProfile)({
      id: 123,
      name: 'name',
      imageUrl: '',
      description: 'description changée',
      comment: 'commentaire changé',
      category: 'OTHER',
      targetProfileForUpdateRepository,
    });

    expect(error).to.be.an.instanceOf(EntityValidationError);
    expect(error.invalidAttributes[0].attribute).to.eq('imageUrl');
    expect(error.invalidAttributes[0].message).to.eq('IMAGE_URL_IS_REQUIRED');
    expect(targetProfileForUpdateRepository.update).to.not.have.been.called;
  });
  it('should throw error when imageUrl is not an URI', async function () {
    // when
    const error = await catchErr(updateTargetProfile)({
      id: 123,
      name: 'name',
      imageUrl: 'hello les copains !',
      description: 'description changée',
      comment: 'commentaire changé',
      category: 'OTHER',
      targetProfileForUpdateRepository,
    });

    expect(error).to.be.an.instanceOf(EntityValidationError);
    expect(error.invalidAttributes[0].attribute).to.eq('imageUrl');
    expect(error.invalidAttributes[0].message).to.eq('IMAGE_URL_IS_REQUIRED');
    expect(targetProfileForUpdateRepository.update).to.not.have.been.called;
  });

  it('should throw error when category value is not amongst valid values', async function () {
    // when
    const error = await catchErr(updateTargetProfile)({
      id: 123,
      name: 'name',
      imageUrl: 'mon image',
      description: 'description changée',
      comment: 'commentaire changé',
      category: 'LE_PAIN_AU_CHOCOLAT_C_TRES_BON',
      targetProfileForUpdateRepository,
    });

    expect(error).to.be.an.instanceOf(EntityValidationError);
    expect(error.invalidAttributes[0].attribute).to.eq('category');
    expect(error.invalidAttributes[0].message).to.eq('CATEGORY_IS_REQUIRED');
    expect(targetProfileForUpdateRepository.update).to.not.have.been.called;
  });

  it('should call repository method to update a target profile', async function () {
    // given
    const baseTargetProfileData = {
      name: 'Tom',
      imageUrl: 'http://ma-super-image/image.png',
      description: 'description changée',
      comment: 'commentaire changé',
      category: 'OTHER',
      areKnowledgeElementsResettable: false,
    };
    const targetProfileToUpdate = {
      targetProfileId: 123,
      ...baseTargetProfileData,
    };

    //when
    await updateTargetProfile({
      id: 123,
      ...baseTargetProfileData,
      targetProfileForUpdateRepository,
    });

    //then
    expect(targetProfileForUpdateRepository.update).to.have.been.calledOnceWithExactly(targetProfileToUpdate);
  });
});
