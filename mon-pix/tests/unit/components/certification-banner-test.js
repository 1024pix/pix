import EmberObject from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';

describe('Unit | Component | Certification Banner', function() {

  setupComponentTest('certification-banner', {
    needs: [],
    unit: true
  });

  let component;

  beforeEach(function() {
    component = this.subject();
  });

  it('should be rendered', function() {
    // when
    this.render();

    // then
    expect(component).to.be.ok;
    expect(this.$()).to.have.length(1);
  });

  describe('@fullname', () => {

    it('should concatenate user first and last name', function() {
      // given
      const fakeUser = EmberObject.create({ firstName: 'Manu', lastName: 'Phillip' });

      // when
      component.set('user', fakeUser);

      // then
      const fullname = component.get('fullname');
      expect(fullname).to.equal('Manu Phillip');
    });
  });

  it('should return user id', function() {
    // given
    const fakeUser = EmberObject.create({ firstName: 'Manu', lastName: 'Phillip', id: 1 });

    // when
    component.set('user', fakeUser);

    // then
    const userId = component.get('user.id');
    expect(userId).to.equal(1);
  });
});
