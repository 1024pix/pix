import { expect } from '../../../../../test-helper.js';
import { Module } from '../../../../../../src/devcomp/domain/models/Module.js';
import * as moduleSerializer from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/module-serializer.js';
import { Text } from '../../../../../../src/devcomp/domain/models/element/Text.js';
import { QCU } from '../../../../../../src/devcomp/domain/models/element/QCU.js';

describe('Unit | DevComp | Serializers | ModuleSerializer', function () {
  describe('#serialize', function () {
    it('should serialize with empty list', function () {
      // given
      const id = 'id';
      const slug = 'les-adresses-mail';
      const title = 'Les adresses mail';
      const moduleFromDomain = new Module({ id, slug, title, grains: [] });
      const expectedJson = {
        data: {
          type: 'modules',
          id: slug,
          attributes: {
            title,
          },
          relationships: {
            grains: {
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
      const moduleFromDomain = new Module({
        id,
        slug,
        title,
        grains: [
          {
            id: '1',
            title: 'Grain 1',
            type: 'activity',
            elements: [
              new Text({ id: '1', content: '' }),
              new QCU({
                id: '2',
                proposals: [{ id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', content: '' }],
                instruction: 'hello',
                solution: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
              }),
            ],
          },
        ],
      });
      const expectedJson = {
        data: {
          attributes: {
            title: 'Les adresses mail',
          },
          id: 'les-adresses-mail',
          relationships: {
            grains: {
              data: [
                {
                  id: '1',
                  type: 'grains',
                },
              ],
            },
          },
          type: 'modules',
        },
        included: [
          {
            attributes: {
              content: '',
              type: 'texts',
            },
            id: '1',
            type: 'texts',
          },
          {
            attributes: {
              instruction: 'hello',
              proposals: [
                {
                  content: '',
                  id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                },
              ],
              type: 'qcus',
            },
            id: '2',
            type: 'qcus',
          },
          {
            attributes: {
              title: 'Grain 1',
              type: 'activity',
            },
            id: '1',
            relationships: {
              elements: {
                data: [
                  {
                    id: '1',
                    type: 'texts',
                  },
                  {
                    id: '2',
                    type: 'qcus',
                  },
                ],
              },
            },
            type: 'grains',
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
