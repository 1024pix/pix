import { ModuleInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { Section } from '../../../../../../src/devcomp/domain/models/module/Section.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';

import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Module | Section', function () {
  describe('#constructor', function () {
    it('should create a section and keep attributes', function () {
      // given
      const id = 1;
      const type = 'practise';
      const grains = [Symbol('text')];

      // when
      const section = new Section({ id, type, grains });

      // then
      expect(section.id).to.equal(id);
      expect(section.type).to.equal(type);
      expect(section.grains).to.have.lengthOf(grains.length);
    });

    describe('if a section does not have an id', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(() => new Section({}))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The id is required for a section');
      });
    });

    describe('if a section does not have a type', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(() => new Section({ id: 1 }))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The type is required for a section');
      });
    });

    describe('if a section does not have a valid type', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(() => new Section({ id: 1, type: 'not-existing' }))();

        // then
        expect(error).to.be.instanceOf(ModuleInstantiationError);
        expect(error.message).to.equal(`The type must be one of ${Section.AVAILABLE_TYPES}`);
      });
    });

    describe('if a section does not have grains', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () =>
            new Section({
              id: 'id_section_1',
              type: 'blank',
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('A list of grains is required for a section');
      });
    });

    describe('if a section has grains with the wrong type', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () =>
            new Section({
              id: 'id_section_1',
              type: 'blank',
              grains: 'elements',
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal(`A list of grains is required for a section`);
      });
    });
  });
});
