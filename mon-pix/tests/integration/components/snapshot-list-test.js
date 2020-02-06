import { resolve } from 'rsvp';
import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | snapshot list', function() {
  setupRenderingTest();

  it('renders', async function() {
    const organization = EmberObject.create({ id: 1, snapshots: resolve([]) });
    this.set('organization', organization);

    await render(hbs`{{snapshot-list organization=organization}}`);
    expect(find('.snapshot-list')).to.exist;
  });

  it('should inform the user when no profile', async function() {
    // Given
    const organization = EmberObject.create({ id: 1, snapshots: resolve([]) });
    this.set('organization', organization);

    // When
    await render(hbs`{{snapshot-list organization=organization}}`);

    // Then
    expect(find('.snapshot-list__no-profile')).to.exist;
    expect(find('.snapshot-list__no-profile').textContent).to.equal('Aucun profil partagé pour le moment');
  });

  it('it should display as many snapshot items as shared', async function() {
    // Given
    const snapshot1 = EmberObject.create({ id: 1 });
    const snapshot2 = EmberObject.create({ id: 2 });
    this.set('snapshots', [snapshot1, snapshot2]);

    // When
    await render(hbs`{{snapshot-list snapshots=snapshots}}`);

    // Then
    return settled().then(function() {
      expect(find('.snapshot-list__no-profile')).to.not.exist;
      expect(findAll('.snapshot-list__snapshot-item')).to.have.lengthOf(2);
    });
  });

  it('should display snapshot informations', async function() {
    // Given
    const user = EmberObject.create({ id: 1, firstName: 'Werner', lastName: 'Heisenberg' });
    const snapshot = EmberObject.create({
      id: 1,
      score: 10,
      numberOfTestsFinished: '3',
      createdAt: '2017-09-25 12:14:33',
      user
    });
    this.set('snapshots', [snapshot]);

    // When
    await render(hbs`{{snapshot-list snapshots=snapshots}}`);

    // Then
    return settled().then(function() {
      expect(find('.snapshot-list__snapshot-item')).to.exist;
      expect(findAll('.snapshot-list__snapshot-item td')[0].textContent.trim()).to.equal(user.get('lastName'));
      expect(findAll('.snapshot-list__snapshot-item td')[1].textContent.trim()).to.equal(user.get('firstName'));
      expect(findAll('.snapshot-list__snapshot-item td')[2].textContent.trim()).to.equal('25/09/2017');
      expect(findAll('.snapshot-list__snapshot-item td')[3].textContent.trim()).to.equal(snapshot.get('score').toString());
      expect(findAll('.snapshot-list__snapshot-item td')[4].textContent.trim()).to.equal(snapshot.get('numberOfTestsFinished') + '/16');
    });
  });
});
