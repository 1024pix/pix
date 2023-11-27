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
      const slug = 'bien-ecrire-son-adresse-mail';
      const title = 'Bien écrire son adresse mail';
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
      const slug = 'bien-ecrire-son-adresse-mail';
      const title = 'Bien écrire son adresse mail';
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
              new Text({ id: '1', content: 'toto' }),
              new QCU({
                id: '2',
                proposals: [{ id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'toto' }],
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
            title: 'Bien écrire son adresse mail',
          },
          id: 'bien-ecrire-son-adresse-mail',
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
              content: 'toto',
              'is-answerable': false,
              type: 'texts',
            },
            id: '1',
            type: 'texts',
          },
          {
            attributes: {
              instruction: 'hello',
              'is-answerable': true,
              proposals: [
                {
                  content: 'toto',
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
