import { expect } from '../../../../test-helper';
import creationCommandValidator from '../../../../../lib/domain/validators/target-profile/creation-command-validation';
import { EntityValidationError } from '../../../../../lib/domain/errors';
import { categories } from '../../../../../lib/domain/models/TargetProfile';

describe('Unit | Domain | Validators | target-profile/creationCommandValidator', function () {
  describe('#validate', function () {
    let validParams;

    beforeEach(function () {
      validParams = {
        name: 'Profil Cible',
        category: categories.OTHER,
        description: 'Une description',
        comment: 'Un commentaire',
        isPublic: true,
        imageUrl: 'url/vers/image',
        ownerOrganizationId: 123,
        tubes: [
          {
            id: 'recTube1',
            level: 3,
          },
          {
            id: 'recTube5',
            level: 1,
          },
        ],
      };
    });

    context('when command validation is successful', function () {
      it('should not throw any error', function () {
        // given
        const targetProfileCreationCommand = validParams;

        // when/then
        expect(creationCommandValidator.validate(targetProfileCreationCommand)).to.not.throw;
      });
    });

    context('when command validation fails', function () {
      it('should reject when name is not valid', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParams,
          name: 123,
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when category is not valid', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParams,
          category: 'unknown category',
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when description is not valid', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParams,
          description: 123,
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when comment is not valid', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParams,
          comment: 123,
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when isPublic is not valid', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParams,
          isPublic: 'not a boolean',
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when imageUrl is not valid', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParams,
          imageUrl: 123,
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when ownerOrganizationId is not valid', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParams,
          ownerOrganizationId: 'not a number',
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when command has no tubes', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParams,
          tubes: [],
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when tube id is not valid', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParams,
          tubes: [{ id: true, level: 5 }],
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when tube level is not valid', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParams,
          tubes: [{ id: 'recTube', level: true }],
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });
    });
  });
});
