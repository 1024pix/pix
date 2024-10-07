import { User } from '../../../../../src/profile/domain/models/User.js';
import { expect, sinon } from '../../../../test-helper.js';

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

  it('should return fullname', function () {
    // when
    const user = new User({ firstName: 'Théo', lastName: 'Courant' });

    // then
    expect(user.fullName).to.equal('Théo COURANT');
  });

  it('should transform to form', function () {
    // given
    const user = new User({ firstName: 'Théo', lastName: 'Courant' });
    const date = new Date('2024-10-02');

    // when
    const form = user.toForm(date, 'FR-fr');

    // then
    expect(form.get('fullName')).to.deep.equal(user.fullName);
    expect(form.get('filename')).to.deep.equal(user.fullName + Date.now());
    expect(form.get('date')).to.deep.equal('02/10/2024');
  });
});
