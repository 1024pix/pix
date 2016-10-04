/* jshint expr:true */
import { expect } from 'chai';
import {
  describeModule,
  it
} from 'ember-mocha';
import {
  beforeEach,
  afterEach
} from 'mocha';

describeModule(
  'service:session',
  'SessionService',
  {},
  function () {

    it('exists', function () {
      let service = this.subject();
      expect(service).to.be.ok;
    });

    let store = {};
    const localStorageStub = {

      getItem(itemName) {
        return store[itemName];
      },

      setItem(itemName, value) {
        store[itemName] = value.toString();
      }
    };
    let originalLocalStorage = window.localStorage;

    beforeEach(function () {
      window.localStorage.getItem = localStorageStub.getItem;
      window.localStorage.setItem = localStorageStub.setItem;
    });

    afterEach(function () {
      window.localStorage.getItem = originalLocalStorage.getItem;
      window.localStorage.setItem = originalLocalStorage.setItem;
    });

    it('contains no user by default', function () {
      expect(this.subject().get('user')).to.not.exist;
    });

    describe('#save', function () {

      it('persists data to Local Storage', function () {
        const session = this.subject();
        const user = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'email'
        };
        session.set('user', user);

        session.save();

        expect(store['pix-live.session']).to.equal(JSON.stringify({ user }));
      });
    });

    describe('#init', function () {

      it('restores data from Local Storage', function () {
        // given
        const storedData = {
          user: {
            firstName: 'Thomas',
            lastName: 'Wickham',
            email: 'twi@octo.com'
          }
        };
        localStorageStub.setItem('pix-live.session', JSON.stringify(storedData));

        // when
        const session = this.subject();

        // then
        const user = session.get('user');
        expect(user).to.deep.equal(storedData.user);
      });

      it('uses an empty session if JSON parsing failed', function () {
        // given
        localStorageStub.setItem('pix-live.session', JSON.stringify({}));

        // when
        const session = this.subject();

        // then
        expect(session.get('user')).to.not.exist;
      });

    });

  });
