import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | QMAIL Item', function() {

  setupTest('component:challenge-item-qmail', {});

  describe('#hasError', function() {
    it('should exists', function() {
      // Given
      const component = this.subject();

      // Then
      expect(component).to.have.property('_hasError').and.to.be.a('function');
    });

    it('should return true when checkbox is not checked', function() {
      // Given
      const component = this.subject();

      // When
      const hasError = component._hasError();

      // Then
      expect(hasError).to.be.true;
    });

    it('should return false when checkbox is checked', function() {
      // Given
      const component = this.subject();
      component.set('_isChecked', true);

      // When
      const hasError = component._hasError();

      // Then
      expect(hasError).to.be.false;
    });
  });

  describe('#getErrorMessage', function() {
    it('should exists', function() {
      // Given
      const component = this.subject();

      // Then
      expect(component).to.have.property('_getErrorMessage').and.to.be.a('function');
    });

    it('should define an error message', function() {
      // Given
      const component = this.subject();

      // When
      const errorMessage = component._getErrorMessage();

      // Then
      expect(errorMessage).to.equal('Pour valider, sélectionner une réponse. Sinon, passer.');
    });
  });

  describe('#getAnswerValue', function() {
    it('should exists', function() {
      // Given
      const component = this.subject();

      // Then
      expect(component).to.have.property('_getAnswerValue').and.to.be.a('function');
    });

    it('should always return #PENDING# while doing a QMAIL challenge', function() {
      // Given
      const component = this.subject();

      // When
      const answerValue = component._getAnswerValue();

      // Then
      expect(answerValue).to.equal('#PENDING#');
    });
  });

});
