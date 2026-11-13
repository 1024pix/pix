import { expect } from 'chai';

import { CustomDraft } from '../../../../../../src/devcomp/domain/models/element/CustomDraft.js';

describe('Unit | Devcomp | Domain | Models | Element | CustomDraft', function () {
  describe('#constructor', function () {
    it('should instantiate a CustomDraft with right properties', function () {
      // Given
      const props = {
        id: 'id',
        title: 'title',
        url: 'https://1024pix.github.io/atelier-contenus/custom-draft.html',
        instruction: '<p>instruction</p>',
        height: 400,
      };

      // When
      const customDraft = new CustomDraft(props);

      // Then
      expect(customDraft.id).to.equal('id');
      expect(customDraft.type).to.equal('custom-draft');
      expect(customDraft.title).to.equal('title');
      expect(customDraft.url).to.equal('https://1024pix.github.io/atelier-contenus/custom-draft.html');
      expect(customDraft.instruction).to.equal('<p>instruction</p>');
      expect(customDraft.height).to.equal(400);
    });

    it('should allow a CustomDraft with an url from pix-epreuves-externes', function () {
      // Given
      const props = {
        id: 'id',
        title: 'title',
        url: 'https://1024pix.github.io/pix-epreuves-externes/custom-draft.html',
        instruction: '<p>instruction</p>',
        height: 400,
      };

      // When
      const customDraft = new CustomDraft(props);

      // Then
      expect(customDraft.url).to.equal('https://1024pix.github.io/pix-epreuves-externes/custom-draft.html');
    });
  });
});
