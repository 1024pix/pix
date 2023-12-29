import { expect } from '../../../../../test-helper.js';
import { Passage } from '../../../../../../src/devcomp/domain/models/Passage.js';
import * as passageSerializer from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/passage-serializer.js';

describe('Unit | DevComp | Infrastructure | Serializers | Jsonapi | PassageSerializer', function () {
  describe('#serialize', function () {
    it('should serialize', function () {
      // given
      const id = 123;
      const moduleId = 'bien-ecrire-son-adresse-mail';
      const moduleFromDomain = new Passage({ id, moduleId });
      const expectedJson = {
        data: {
          type: 'passages',
          id: id.toString(),
          attributes: {
            'module-id': moduleId,
          },
        },
      };

      // when
      const json = passageSerializer.serialize(moduleFromDomain);

      // then
      expect(json).to.deep.equal(expectedJson);
    });
  });
});
