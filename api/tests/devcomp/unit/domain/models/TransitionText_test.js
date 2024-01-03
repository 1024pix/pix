import { TransitionText } from '../../../../../src/devcomp/domain/models/TransitionText.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | TransitionText', function () {
  describe('#constructor', function () {
    it('should create a module and keep attributes', function () {
      // when
      const transitionText = new TransitionText({ content: 'content', grainId: 'grain-id' });

      // then
      expect(transitionText.content).to.equal('content');
      expect(transitionText.grainId).to.equal('grain-id');
    });
  });

  describe('if a transition text does not have a content', function () {
    it('should throw an error', function () {
      expect(() => new TransitionText({})).to.throw('Le contenu est obligatoire pour un texte de transition');
    });
  });

  describe('if a transition text does not have a grain id', function () {
    it('should throw an error', function () {
      expect(() => new TransitionText({ content: '' })).to.throw(
        "L'id de grain est obligatoire pour un texte de transition",
      );
    });
  });
});
