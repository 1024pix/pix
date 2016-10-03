/* jshint expr:true */
import {expect} from 'chai';
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
  {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  },
  function () {
    // Replace this with your real tests.
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

    it('starts empty', function () {
      let session = this.subject();
      expect(session.get('firstname')).to.be.empty;
      expect(session.get('lastname')).to.be.empty;
      expect(session.get('email')).to.be.empty;
      expect(session.get('isIdentified')).to.be.false;
    });


    it('#save() save data to localStorage', function () {
      const session = this.subject();
      const values = {
        firstname: 'firstname',
        lastname: 'lastname',
        email: 'email'
      };
      session.setProperties(values);

      session.save();

      expect(store['pix-live.session']).to.eq(JSON.stringify(values));
    });

    it('#init() restore data from localStorage', function () {
      const values = {
        firstname: 'Thomas',
        lastname: 'Wickham',
        email: 'twi@octo.com'
      };
      localStorageStub.setItem('pix-live.session', JSON.stringify(values));
      const session = this.subject();

      values.isIdentified = true;
      const sut = session.getProperties('firstname', 'lastname', 'email', 'isIdentified');
      expect(sut).to.deep.eq(values);
    });

    it('#init() use an empty session is JSON parsing failed', function () {
      localStorageStub.setItem('pix-live.session', '[object Object]');
      const session = this.subject();

      const expected = {
        firstname: "",
        lastname: "",
        email: "",
        isIdentified: false
      };
      const sut = session.getProperties('firstname', 'lastname', 'email', 'isIdentified');
      expect(sut).to.deep.eq(expected);
    });
  });
