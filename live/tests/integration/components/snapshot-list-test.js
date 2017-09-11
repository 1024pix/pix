import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

describe('Integration | Component | snapshot list', function() {
  setupComponentTest('snapshot-list', {
    integration: true
  });

  it('renders', function() {
    const organization = Ember.Object.create({ id: 1, snapshots: Ember.RSVP.resolve([]) });
    this.set('organization', organization);

    this.render(hbs`{{snapshot-list organization=organization}}`);
    expect(this.$()).to.have.length(1);
  });

  it('should inform the user when no profile', function() {
    // Given
    const organization = Ember.Object.create({ id: 1, snapshots: Ember.RSVP.resolve([]) });
    this.set('organization', organization);

    // When
    this.render(hbs`{{snapshot-list organization=organization}}`);

    // Then
    expect(this.$('.snapshot-list__no-profile')).to.have.length(1);
    expect(this.$('.snapshot-list__no-profile').text()).to.equal('Aucun profil partagé pour le moment');
  });

  it('it should display as many snapshot items as shared', function() {
    // Given
    const snapshot1 = Ember.Object.create({ id: 1 });
    const snapshot2 = Ember.Object.create({ id: 2 });
    const organization = Ember.Object.create({ id: 1, snapshots: Ember.RSVP.resolve([snapshot1, snapshot2]) });
    this.set('organization', organization);

    // When
    this.render(hbs`{{snapshot-list organization=organization}}`);

    // Then
    return wait().then(function() {
      expect(this.$('.snapshot-list__no-profile')).to.have.length(0);
      expect(this.$('.snapshot-list__snapshot-item')).to.have.length(2);
    }.bind(this));
  });

  it('should display snapshot informations', function() {
    // Given
    const user = Ember.Object.create({ id: 1, firstName: 'Werner', lastName: 'Heisenberg' });
    const snapshot = Ember.Object.create({
      id: 1,
      score: 10,
      completionPercentage: '25',
      createdAt: '09/25/2017',
      user
    });
    const organization = Ember.Object.create({ id: 1, snapshots: Ember.RSVP.resolve([snapshot]) });
    this.set('organization', organization);

    // When
    this.render(hbs`{{snapshot-list organization=organization}}`);

    // Then
    return wait().then(function() {
      expect(this.$('.snapshot-list__snapshot-item')).to.have.length(1);
      expect(this.$('.snapshot-list__snapshot-item td:eq(0)').text().trim()).to.equal(user.get('lastName'));
      expect(this.$('.snapshot-list__snapshot-item td:eq(1)').text().trim()).to.equal(user.get('firstName'));
      expect(this.$('.snapshot-list__snapshot-item td:eq(2)').text().trim()).to.equal('25/09/2017');
      expect(this.$('.snapshot-list__snapshot-item td:eq(3)').text().trim()).to.equal(snapshot.get('score').toString());
      expect(this.$('.snapshot-list__snapshot-item td:eq(4)').text().trim()).to.equal(snapshot.get('completionPercentage')+'%');
    }.bind(this));
  });
});
