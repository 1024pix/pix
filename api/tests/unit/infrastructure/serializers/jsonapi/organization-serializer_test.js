const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-serializer');
const Organization = require('../../../../../lib/domain/models/data/organization');
const User = require('../../../../../lib/domain/models/data/user');

describe('Unit | Serializer | organization-serializer', () => {

  describe('#serialize', () => {
    it('should', () => {
      // Given
      const user = new User({
        'firstName': 'Alexander',
        'lastName': 'Luthor',
        'email': 'lex@lexcorp.com'
      });
      user.set('id', 42157);
      const organization = new Organization({
        id: 12,
        name: 'LexCorp',
        type: 'PRO',
        email: 'lex@lexcorp.com',
        code: 'ABCD66',
        userId: '42157'
      });
      organization.user = user;

      // When
      const jsonOrganization = serializer.serialize(organization);

      // Then
      expect(jsonOrganization).to.deep.equal({
        data: {
          type: 'organizations',
          id: 12,
          attributes: {
            name: 'LexCorp',
            email: 'lex@lexcorp.com',
            type: 'PRO',
            code: 'ABCD66'
          },
          relationships: {
            user: {
              data: { type: 'users', id: '42157' }
            },
          }
        },
        included: [{
          id: 42157,
          type: 'users',
          attributes: {
            'first-name': 'Alexander',
            'last-name': 'Luthor',
            email: 'lex@lexcorp.com'
          }
        }]
      });
    });
  });

  describe('#deserialize', () => {

    it('should convert JSON API data into a Organization model object', () => {
      const expectedModelObject = new Organization({
        name: 'The name of the organization',
        email: 'organization@email.com',
        type: 'SUP'
      });
      const jsonOrganization = {
        data: {
          attributes: {
            name: 'The name of the organization',
            email: 'organization@email.com',
            type: 'SUP',
            'first-name': 'Daft',
            'last-name': 'Punk'
          },
          type: 'organizations'
        }
      };

      // when
      const deserializedObject = serializer.deserialize(jsonOrganization);

      // then
      expect(deserializedObject.toJSON()).to.deep.equal(expectedModelObject.toJSON());
    });

  });

});

