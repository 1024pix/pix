const { expect, catchErr } = require('../../../test-helper');
const TargetProfileForCreation = require('../../../../lib/domain/models/TargetProfileForCreation');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | TargetProfileForUpdate', function () {
  describe('#new', function () {
    it('creates a target profile', function () {
      const targetProfile = new TargetProfileForCreation({
        name: 'name',
        category: TargetProfile.categories.OTHER,
        skillIds: [1],
        description: 'description',
        comment: 'comment',
        isPublic: true,
        imageUrl: 'url',
        ownerOrganizationId: 1,
      });

      expect(targetProfile).to.deep.eq({
        name: 'name',
        category: TargetProfile.categories.OTHER,
        skillIds: [1],
        description: 'description',
        comment: 'comment',
        isPublic: true,
        imageUrl: 'url',
        ownerOrganizationId: 1,
      });
    });

    context('when the image url is not given', function () {
      it('set a value by default', function () {
        const targetProfile = new TargetProfileForCreation({
          name: 'name',
          category: TargetProfile.categories.OTHER,
          skillIds: [1],
          description: 'description',
          comment: 'comment',
          isPublic: true,
          ownerOrganizationId: 1,
        });

        expect(targetProfile.imageUrl).to.eq('https://images.pix.fr/profil-cible/Illu_GEN.svg');
      });
    });

    context('when the image url is null', function () {
      it('set a value by default', function () {
        const targetProfile = new TargetProfileForCreation({
          name: 'name',
          category: TargetProfile.categories.OTHER,
          skillIds: [1],
          description: 'description',
          comment: 'comment',
          isPublic: true,
          imageUrl: null,
          ownerOrganizationId: 1,
        });

        expect(targetProfile.imageUrl).to.eq('https://images.pix.fr/profil-cible/Illu_GEN.svg');
      });
    });

    context('when the category is not given', function () {
      it('set a value by default', function () {
        const targetProfile = new TargetProfileForCreation({
          name: 'name',
          skillIds: [1],
          description: 'description',
          comment: 'comment',
          isPublic: true,
          ownerOrganizationId: 1,
        });

        expect(targetProfile.category).to.eq(TargetProfile.categories.OTHER);
      });
    });

    context('name validations', function () {
      context('when there is no name given', function () {
        it('does not create a target profile', async function () {
          const attributes = {
            name: undefined,
            category: TargetProfile.categories.OTHER,
            ownerOrganizationId: 1,
            skillIds: [1],
          };

          const error = await catchErr(() => new TargetProfileForCreation(attributes))();

          expect(error).to.be.an.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].attribute).to.eq('name');
          expect(error.invalidAttributes[0].message).to.eq('NAME_IS_REQUIRED');
        });
      });

      context('when name is null', function () {
        it('does not create a target profile', async function () {
          const attributes = {
            name: null,
            category: TargetProfile.categories.OTHER,
            ownerOrganizationId: 1,
            skillIds: [1],
          };

          const error = await catchErr(() => new TargetProfileForCreation(attributes))();

          expect(error).to.be.an.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].attribute).to.eq('name');
          expect(error.invalidAttributes[0].message).to.eq('NAME_IS_REQUIRED');
        });
      });
    });

    context('category validations', function () {
      context('when category is null', function () {
        it('does not create the target profile', async function () {
          const attributes = {
            name: 'name',
            category: null,
            ownerOrganizationId: 1,
            skillIds: [1],
          };

          const error = await catchErr(() => new TargetProfileForCreation(attributes))();

          expect(error).to.be.an.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].attribute).to.eq('category');
          expect(error.invalidAttributes[0].message).to.eq('CATEGORY_IS_REQUIRED');
        });
      });

      context('when category is not an existing category', function () {
        it('does not create the target profile', async function () {
          const attributes = {
            name: 'name',
            category: 'BadNews',
            ownerOrganizationId: 1,
            skillIds: [1],
          };

          const error = await catchErr(() => new TargetProfileForCreation(attributes))();

          expect(error).to.be.an.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].attribute).to.eq('category');
          expect(error.invalidAttributes[0].message).to.eq('CATEGORY_IS_REQUIRED');
        });
      });
    });

    context('skillIds validations', function () {
      context('when there is no skill id given', function () {
        it('does not create a target profile', async function () {
          const attributes = {
            name: 'name',
            category: TargetProfile.categories.OTHER,
            ownerOrganizationId: 1,
            skillIds: undefined,
          };

          const error = await catchErr(() => new TargetProfileForCreation(attributes))();

          expect(error).to.be.an.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].attribute).to.eq('skillIds');
          expect(error.invalidAttributes[0].message).to.eq('SKILLS_REQUIRED');
        });
      });

      context('when there is an empty list of skill id', function () {
        it('does not create a target profile', async function () {
          const attributes = {
            name: 'name',
            category: TargetProfile.categories.OTHER,
            ownerOrganizationId: 1,
            skillIds: [],
          };

          const error = await catchErr(() => new TargetProfileForCreation(attributes))();

          expect(error).to.be.an.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].attribute).to.eq('skillIds');
          expect(error.invalidAttributes[0].message).to.eq('SKILLS_REQUIRED');
        });
      });

      context('when there is null as list of skill id', function () {
        it('does not create a target profile', async function () {
          const attributes = {
            name: 'name',
            category: TargetProfile.categories.OTHER,
            ownerOrganizationId: 1,
            skillIds: null,
          };

          const error = await catchErr(() => new TargetProfileForCreation(attributes))();

          expect(error).to.be.an.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].attribute).to.eq('skillIds');
          expect(error.invalidAttributes[0].message).to.eq('SKILLS_REQUIRED');
        });
      });

      context('when there is null in the list of skill ids', function () {
        it('does not create a target profile', async function () {
          const attributes = {
            name: 'name',
            category: TargetProfile.categories.OTHER,
            ownerOrganizationId: 1,
            skillIds: [null],
          };

          const error = await catchErr(() => new TargetProfileForCreation(attributes))();
          expect(error).to.be.an.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].attribute).to.eq(0);
          expect(error.invalidAttributes[0].message).to.eq('SKILLS_REQUIRED');
        });
      });
    });
  });
});
