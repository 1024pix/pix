import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | organization-invitations', function (hooks) {
  setupTest(hooks);

  test('it should return the invitations sorted by updated date', async function (assert) {
    // given
    const component = createGlimmerComponent('component:organizations/invitations');

    component.args.invitations = [
      { email: 'riri@example.net', role: 'ADMIN', updatedAt: new Date('2020-10-08T10:50:00Z') },
      { email: 'loulou@example.net', role: 'MEMBER', updatedAt: new Date('2018-10-08T10:50:00Z') },
      { email: 'fifi@example.net', role: null, updatedAt: new Date('2019-10-08T10:50:00Z') },
      { email: 'lili@example.net', role: 'MEMBER', updatedAt: new Date('2021-10-08T10:50:00Z') },
    ];

    // when
    const sortedInvitations = component.sortedInvitations;

    // then
    const expectedSortedInvitations = [
      { email: 'lili@example.net', role: 'MEMBER', updatedAt: new Date('2021-10-08T10:50:00Z') },
      { email: 'riri@example.net', role: 'ADMIN', updatedAt: new Date('2020-10-08T10:50:00Z') },
      { email: 'fifi@example.net', role: null, updatedAt: new Date('2019-10-08T10:50:00Z') },
      { email: 'loulou@example.net', role: 'MEMBER', updatedAt: new Date('2018-10-08T10:50:00Z') },
    ];
    assert.deepEqual(sortedInvitations, expectedSortedInvitations);
  });
});
