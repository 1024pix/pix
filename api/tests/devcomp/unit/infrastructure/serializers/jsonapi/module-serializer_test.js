import { expect } from '../../../../../test-helper.js';
import { Module } from '../../../../../../src/devcomp/domain/models/Module.js';
import * as moduleSerializer from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/module-serializer.js';
import { Lesson } from '../../../../../../src/devcomp/domain/models/Lesson.js';

describe('Unit | DevComp | Serializers | ModuleSerializer', function () {
  describe('#serialize', function () {
    it('should serialize with empty list', function () {
      // given
      const id = 'id';
      const slug = 'les-adresses-mail';
      const title = 'Les adresses mail';
      const moduleFromDomain = new Module({ id, slug, title, list: [] });
      const expectedJson = {
        data: {
          type: 'modules',
          id: slug,
          attributes: {
            title,
          },
          relationships: {
            elements: {
              data: [],
            },
          },
        },
      };

      // when
      const json = moduleSerializer.serialize(moduleFromDomain);

      // then
      expect(json).to.deep.equal(expectedJson);
    });

    it('should serialize with list', function () {
      // given
      const id = 'id';
      const slug = 'les-adresses-mail';
      const title = 'Les adresses mail';
      const moduleFromDomain = new Module({ id, slug, title, list: [new Lesson({ id: '1', content: '' })] });
      const expectedJson = {
        data: {
          type: 'modules',
          id: slug,
          attributes: {
            title,
          },
          relationships: {
            elements: {
              data: [
                {
                  type: 'elements',
                  id: '1',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'elements',
            id: '1',
            attributes: {
              content: '',
            },
          },
        ],
      };

      // when
      const json = moduleSerializer.serialize(moduleFromDomain);

      // then
      expect(json).to.deep.equal(expectedJson);
    });
  });
});
