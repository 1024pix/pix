import { duplicateModule } from '../../../../../src/devcomp/domain/usecases/duplicate-module.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | UseCases | duplicate-module', function () {
  describe('#duplicateModule', function () {
    it('should set a new slug suffixed with "-copie"', function () {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        shortId: '6a68bf32',
      };

      // when
      const result = duplicateModule({ moduleData });

      // then
      expect(result.slug).to.equal('bac-a-sable-copie');
    });

    it('should set a new title suffixed with " (copie)"', function () {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        shortId: '6a68bf32',
      };

      // when
      const result = duplicateModule({ moduleData });

      // then
      expect(result.title).to.equal('Bac à sable (copie)');
    });

    it('should generate a new 8-character hexadecimal shortId', function () {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        shortId: '6a68bf32',
      };

      // when
      const result = duplicateModule({ moduleData });

      // then
      expect(result.shortId).to.match(/^[0-9a-f]{8}$/);
      expect(result.shortId).to.not.equal(moduleData.shortId);
    });

    it('should regenerate all UUID ids found in the module data', function () {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        shortId: '6a68bf32',
        sections: [{ id: 'cfaefec9-e185-43b8-8258-e8beff6dd56b', grains: [] }],
      };

      // when
      const result = duplicateModule({ moduleData });

      // then
      expect(result.id).to.not.equal(moduleData.id);
      expect(result.sections[0].id).to.not.equal(moduleData.sections[0].id);
    });

    it('should not mutate the original module data', function () {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        shortId: '6a68bf32',
      };
      const originalCopy = JSON.parse(JSON.stringify(moduleData));

      // when
      duplicateModule({ moduleData });

      // then
      expect(moduleData).to.deep.equal(originalCopy);
    });

    it('should leave non-UUID id values unchanged', function () {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        shortId: '6a68bf32',
        sections: [{ id: 'section-1', grains: [{ id: '1', proposals: [{ id: '1' }, { id: '2' }] }] }],
      };

      // when
      const result = duplicateModule({ moduleData });

      // then
      expect(result.sections[0].id).to.equal('section-1');
      expect(result.sections[0].grains[0].id).to.equal('1');
      expect(result.sections[0].grains[0].proposals[0].id).to.equal('1');
    });
  });
});
