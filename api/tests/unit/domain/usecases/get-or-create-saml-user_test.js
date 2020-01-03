const { expect, sinon } = require('../../../test-helper');
const User = require('../../../../lib/domain/models/User');
const getOrCreateSamlUser = require('../../../../lib/domain/usecases/get-or-create-saml-user');

describe('Unit | UseCase | get-or-create-saml-user', () => {

  const userAttributes = {
    'IDO': 'saml-id-for-adele',
    'NOM': 'Lopez',
    'PRE': 'Adèle',
  };

  let userRepository;

  beforeEach(() => {
    userRepository = {
      create: () => {},
      getBySamlId: () => {},
    };
  });

  const expectedUser = new User({
    firstName: 'Adèle',
    lastName: 'Lopez',
    samlId: 'saml-id-for-adele',
    password: '',
    cgu: false,
  });

  const settings = {
    saml: {
      attributeMapping: {
        samlId: 'IDO',
        firstName: 'PRE',
        lastName: 'NOM',
      }
    }
  };

  context('when user does not exist in database yet', () => {

    beforeEach(() => {
      sinon.stub(userRepository, 'getBySamlId').resolves(null);
      sinon.stub(userRepository, 'create').callsFake((user) => Promise.resolve(user));
    });

    it('should create and return a saved user', () => {
      // when
      const promise = getOrCreateSamlUser({ userAttributes, userRepository, settings });

      // then
      return promise.then((user) => {
        expect(user).to.deep.equal(expectedUser);
      });
    });
  });

  context('when user already exists in database', () => {

    beforeEach(() => {
      sinon.stub(userRepository, 'getBySamlId')
        .withArgs('saml-id-for-adele')
        .resolves(expectedUser);
    });

    it('should return the existing user', () => {
      // when
      const promise = getOrCreateSamlUser({ userAttributes, userRepository, settings });

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal(expectedUser);
      });
    });
  });
});
