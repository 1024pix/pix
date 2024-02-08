import { JuryComment } from '../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | JuryComment', function () {
  describe('#shouldTranslate', function () {
    describe('when commentByAutoJury exists', function () {
      it('should return true', function () {
        // Given
        const juryComment = new JuryComment({ commentByAutoJury: 'FRAUD' });
        // When
        const result = juryComment.shouldTranslate();
        // Then
        expect(result).to.equal(true);
      });
    });

    describe('when commentByAutoJury does not exist', function () {
      it('should return false', function () {
        // Given
        const juryComment = new JuryComment({ commentByAutoJury: null });
        // When
        const result = juryComment.shouldTranslate();
        // Then
        expect(result).to.equal(false);
      });
    });
  });

  describe('#getKeyToTranslate', function () {
    it('should return commentByAutoJury', function () {
      // Given
      const juryComment = new JuryComment({ commentByAutoJury: 'FRAUD' });
      // When
      const result = juryComment.getKeyToTranslate();
      // Then
      expect(result).to.equal('FRAUD');
    });
  });

  describe('#getPlainTextComment', function () {
    it('should return the comment', function () {
      // Given
      const juryComment = new JuryComment({ fallbackComment: 'Le petit Max a copié la réponse sur Lily!!' });
      // When
      const result = juryComment.getFallbackComment();
      // Then
      expect(result).to.equal('Le petit Max a copié la réponse sur Lily!!');
    });
  });
});
