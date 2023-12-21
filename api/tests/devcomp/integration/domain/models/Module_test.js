import { Module } from '../../../../../src/devcomp/domain/models/Module.js';
import { expect } from '../../../../test-helper.js';
import { Grain } from '../../../../../src/devcomp/domain/models/Grain.js';
import { Text } from '../../../../../src/devcomp/domain/models/element/Text.js';

describe('Integration | Devcomp | Domain | Models | Module', function () {
  describe('When a transition text is related to a missing grain', function () {
    it('should throw an error', function () {
      // given
      const grain = new Grain({
        id: '1',
        title: 'Le format des adresses email',
        elements: [new Text({ id: 'id', content: 'content' })],
      });
      const id = '1';
      const slug = 'les-adresses-email';
      const title = 'Les adresses email';
      const grains = [grain];
      const transitionTexts = [
        {
          grainId: '1',
          content: 'content grain 1',
        },
        {
          grainId: '2',
          content: 'content grain 2',
        },
      ];

      expect(() => new Module({ id, slug, title, grains, transitionTexts })).to.throw(
        'Tous les textes de transition doivent être lié à un grain présent dans le module',
      );
    });
  });
});
