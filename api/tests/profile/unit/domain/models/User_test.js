import sinon from 'sinon';

import { User } from '../../../../../src/profile/domain/models/User.js';
import { normalizeAndRemoveAccents } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Profile | Domain | Models | User', function () {
  let clock;
  const now = new Date('2022-12-25');

  beforeEach(function () {
    clock = sinon.useFakeTimers({
      now,
      toFake: ['Date'],
    });
  });

  afterEach(async function () {
    clock.restore();
  });

  it('should return uppercased firstName', function () {
    // when
    const user = new User({ firstName: ' théo-miCHel de la villette-- ', lastName: 'Courant' });

    // then
    expect(user.firstName).to.equal('THÉO-MICHEL DE LA VILLETTE--');
  });

  it('should return uppercased lastName', function () {
    // when
    const user = new User({ firstName: 'Théo', lastName: ' courant--mArchand ' });

    // then
    expect(user.lastName).to.equal('COURANT--MARCHAND');
  });

  it('should transform to form', function () {
    // given
    const user = new User({ firstName: 'Théo', lastName: 'Courant' });
    const date = new Date('2024-10-02');

    // when
    const form = user.toForm(date, 'FR-fr', normalizeAndRemoveAccents);

    // then
    expect(form.get('firstName')).to.deep.equal(user.firstName);
    expect(form.get('lastName')).to.deep.equal(user.lastName);
    expect(form.get('filename')).to.deep.equal('courant_theo_' + Date.now());
    expect(form.get('date')).to.deep.equal('02/10/2024');
  });
});
