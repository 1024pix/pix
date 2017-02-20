import {expect} from 'chai';
import {describe, it} from 'mocha';
import {setupTest} from 'ember-mocha';


describe('Unit | Component | followerComponent', function () {
  setupTest('component:follower-form', {});

  describe('Computed property', function () {
    let component;

    function initComponent() {
      component = this.subject();
    }

    it('should returns true when hasError change', function () {
      initComponent.call(this);
      // when
      component.set('hasError', true);
      // then
      expect(component.get('infoMessage')).to.exist;
    });

    it('should returns an error message when hasError get true', function () {
      // given
      initComponent.call(this);
      // when
      component.set('hasError', true);
      component.set('isSubmited', true);
      // then
      expect(component.get('infoMessage')).to.equal('Votre adresse n\'est pas valide');
    });
  });

});
