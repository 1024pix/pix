import { CustomDraft } from '../../../../../../src/devcomp/domain/models/element/CustomDraft.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';

import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

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

  describe('A custom-draft without url', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () => new CustomDraft({ id: 'id', title: 'title', instruction: '<p>instruction</p>' }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The URL is required for a custom-draft');
    });
  });

  describe('A custom-draft with invalid url', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () => new CustomDraft({ id: 'id', title: 'title', url: 'url', instruction: '<p>instruction</p>' }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The URL must be a valid URL for a custom-draft');
    });
  });

  describe('When custom-draft URL is not from 1024pix.github.io/atelier-contenus nor 1024pix.github.io/pix-epreuves-externes', function () {
    it('should throw an error', function () {
      // given & when
      const error = catchErrSync(
        () =>
          new CustomDraft({
            id: 'id',
            title: 'title',
            url: 'https://images.pix.fr/coolcat.jpg',
            instruction: '<p>instruction</p>',
            height: 400,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal(
        'The custom-draft URL must be from "1024pix.github.io/atelier-contenus" or "1024pix.github.io/pix-epreuves-externes"',
      );
    });
  });
});
