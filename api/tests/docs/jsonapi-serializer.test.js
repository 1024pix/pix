import { expect } from '../test-helper';

import { Serializer } from 'jsonapi-serializer';
const resourceType = 'users';

describe('Docs | jsonapi-serializer', function () {
  describe('when serializing a complex object', function () {
    it('should construct a relationship json-api object with attributes of each resource by default', function () {
      // The json-api-serializer will serialize this complex object into a json-api compliant object
      // To do so, we must declare what are its attributes and its relationships. The lib takes care of the rest.
      const user = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        car: { id: 1, name: 'Ferrari', type: 'propulsion' },
        job: { id: 1, title: 'dev', salary: 1337 },
        books: [
          { id: 1, title: 'Alice in Wonderland', cost: 20 },
          { id: 2, title: 'From Russia with love', cost: 13 },
        ],
        friend: { id: 1, firstName: 'Jane' },
        address: { id: 1, streetName: 'Baker street' },
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName', 'car', 'job', 'books', 'friend', 'address'],
        job: {
          ref: 'id', // Declaring a 'ref' property will populate the 'relationship' object, with the 'data' object containing only 'id' and 'type'
        },
        address: {
          ref: 'id',
          ignoreRelationshipData: true, // Unless this is set to true, in which case it it will default to an empty object
        },
        books: {
          ref: 'id',
          attributes: ['title', 'cost'], // Declaring the attributes of a relationship will automatically add it as a top level 'include'
        },
        friend: {
          ref: 'id',
          // When both these are present, the lib will still include the relationship objects, but wont populate the 'relationship' property
          attributes: ['firstName'],
          ignoreRelationshipData: true,
        },
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
            // "last-name": "Doe", This wont be present because it was not declared as an attribute
            car: { id: 1, name: 'Ferrari', type: 'propulsion' }, // when relationship is not explicitly declared, its just embeded as json
          },
          id: '1',
          type: 'users',
          relationships: {
            job: {
              data: {
                id: '1',
                type: 'jobs',
              },
            },
            books: {
              data: [
                { id: '1', type: 'books' },
                { id: '2', type: 'books' },
              ],
            },
            // ignoreRelationshipData: true, is set for both
            address: {},
            friend: {},
          },
        },
        included: [
          {
            id: '1',
            type: 'books',
            attributes: {
              title: 'Alice in Wonderland',
              cost: 20,
            },
          },
          {
            id: '2',
            type: 'books',
            attributes: {
              title: 'From Russia with love',
              cost: 13,
            },
          },
          {
            id: '1',
            type: 'friends',
            attributes: {
              'first-name': 'Jane',
            },
          },
        ],
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when serializing with just attributes', function () {
    it('should only serialize the requested attributes and automatically dash-case them', function () {
      const user = {
        firstName: 'John',
        age: 20,
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName'],
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
          },
          type: 'users',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when serializing with a nested object not declared as relationship', function () {
    it('should embed the object "as in"', function () {
      const user = {
        firstName: 'John',
        address: { street: 'Baker street' },
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName', 'address'],
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
            address: { street: 'Baker street' },
          },
          type: 'users',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when using top links', function () {
    it('should copy the topLevelLinks object, constructing the link with a function of the data', function () {
      const user = {
        id: '1',
        firstName: 'John',
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName'],
        topLevelLinks: {
          rel: (user) => `https://example.com/api/users/${user.id}`,
        },
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
          },
          id: '1',
          type: 'users',
        },
        links: {
          rel: 'https://example.com/api/users/1',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when using top meta information', function () {
    it('should copy the meta object at the top level of the serialized object', function () {
      const user = {
        firstName: 'John',
        age: 20,
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName'],
        meta: { some: 'meta' },
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
          },
          type: 'users',
        },
        meta: { some: 'meta' },
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when using data links', function () {
    it('should copy the dataLink object, constructing the link with a function of the data', function () {
      const user = {
        id: '1',
        firstName: 'John',
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName'],
        dataLinks: {
          rel: (user) => `https://example.com/api/users/${user.id}`,
        },
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
          },
          links: {
            rel: 'https://example.com/api/users/1',
          },
          id: '1',
          type: 'users',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when using data meta information', function () {
    it('should copy the meta object at the top level of the serialized object', function () {
      const user = {
        firstName: 'John',
        age: 20,
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName'],
        dataMeta: { some: 'meta' },
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
          },
          meta: { some: 'meta' },
          type: 'users',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when simple object with relationship', function () {
    it('should construct a relationship json-api object whose ref property matches the value', function () {
      const user = {
        id: '1',
        firstName: 'John',
        job: { title: 'dev', salary: 1337 },
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName', 'job'],
        job: {
          // This typically is set to the string 'id' but it does not have to be, as demonstrated here
          ref: 'title',
        },
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
          },
          id: '1',
          type: 'users',
          relationships: {
            job: {
              data: {
                id: 'dev',
                type: 'jobs',
              },
            },
          },
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when simple object with relationship along with their attributes', function () {
    it('should construct a relationship json-api object with attributes of each resource by default', function () {
      const user = {
        id: '1',
        firstName: 'John',
        job: { id: 1, title: 'dev', salary: 1337 },
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName', 'job'],
        job: {
          ref: 'id',
          attributes: ['dev', 'salary'],
        },
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
          },
          id: '1',
          type: 'users',
          relationships: {
            job: {
              data: {
                id: '1',
                type: 'jobs',
              },
            },
          },
        },
        included: [
          {
            id: '1',
            type: 'jobs',
            attributes: {
              salary: 1337,
            },
          },
        ],
      };

      expect(serialized).to.deep.equal(expected);
    });
    it('should construct a relationship json-api object with attributes of each resource, without included when specified', function () {
      const user = {
        id: '1',
        firstName: 'John',
        job: { id: 1, title: 'dev', salary: 1337 },
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName', 'job'],
        job: {
          ref: 'id',
          attributes: ['dev', 'salary'],
          included: false,
        },
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
          },
          id: '1',
          type: 'users',
          relationships: {
            job: {
              data: {
                id: '1',
                type: 'jobs',
              },
            },
          },
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when simple object with relationship along with their attributes and relationship meta', function () {
    it('should construct a relationship json-api object with attributes of each resource by default', function () {
      const user = {
        id: '1',
        firstName: 'John',
        job: { id: 1, title: 'dev', salary: 1337 },
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName', 'job'],
        job: {
          ref: 'id',
          attributes: ['dev', 'salary'],
          relationshipMeta: { some: 'data' },
        },
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
          },
          id: '1',
          type: 'users',
          relationships: {
            job: {
              meta: { some: 'data' },
              data: {
                id: '1',
                type: 'jobs',
              },
            },
          },
        },
        included: [
          {
            id: '1',
            type: 'jobs',
            attributes: {
              salary: 1337,
            },
          },
        ],
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when simple object with relationship along with their attributes and relationship links', function () {
    it('should construct a relationship json-api object with attributes of each resource by default', function () {
      const user = {
        id: '1',
        firstName: 'John',
        job: { id: 1, title: 'dev', salary: 1337 },
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName', 'job'],
        job: {
          ref: 'id',
          attributes: ['dev', 'salary'],
          relationshipLinks: {
            related: 'some constant link',
            self: (relationship) => 'some relationship link using relationship data ' + relationship.id,
          },
        },
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
          },
          id: '1',
          type: 'users',
          relationships: {
            job: {
              data: {
                id: '1',
                type: 'jobs',
              },
              links: {
                related: 'some constant link',
                self: 'some relationship link using relationship data 1',
              },
            },
          },
        },
        included: [
          {
            id: '1',
            type: 'jobs',
            attributes: {
              salary: 1337,
            },
          },
        ],
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when dealing with missing data input', function () {
    it('should silently ignore the missing data', function () {
      const user = {
        firstName: 'John',
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName', 'age'],
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
          },
          type: 'users',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
    it('should allow to override', function () {
      const user = {
        firstName: 'John',
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName', 'age'],
        age: {
          nullIfMissing: true,
        },
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
            age: null,
          },
          type: 'users',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when transforming each record before serialization', function () {
    it('should copy the meta object as top level meta JSON-API object', function () {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['fullName'],
        transform(record) {
          record.fullName = record.firstName + ' ' + record.lastName;
          return record;
        },
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'full-name': 'John Doe',
          },
          type: 'users',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when serializing with different key formatting', function () {
    it('should allow to serialize on a different case, and ignore attributes not in camelCase', function () {
      const user = {
        firstName: 'John',
        last_name: 'Doe',
        superAge: 20,
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName', 'lastName', 'superAge'],
        keyForAttribute: 'snake_case',
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            first_name: 'John',
            super_age: 20,
          },
          type: 'users',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
    it('should allow to serialize on a different case by specifying a function', function () {
      const user = {
        firstName: 'John',
        last_name: 'Doe',
        superAge: 20,
      };

      const serialized = new Serializer(resourceType, {
        attributes: ['firstName', 'lastName', 'superAge'],
        keyForAttribute: (key) => `__${key}__`,
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            __firstName__: 'John',
            __superAge__: 20,
          },
          type: 'users',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
  describe('when type is not passed-in pluralized', function () {
    it('should automatically pluralize the type', function () {
      const user = {
        firstName: 'John',
      };

      const serialized = new Serializer('user', {
        attributes: ['firstName'],
      }).serialize(user);

      const expected = {
        data: {
          attributes: {
            'first-name': 'John',
          },
          type: 'users',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
    // Implementation currently based on the inflected library: https://www.npmjs.com/package/inflected
    it('should adjust when it must adds more than the s letter', function () {
      const body = {
        size: 'large',
      };

      const serialized = new Serializer('body', {
        attributes: ['size'],
      }).serialize(body);

      const expected = {
        data: {
          attributes: {
            size: 'large',
          },
          type: 'bodies',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
    it('should allow override to not pluralize', function () {
      const body = {
        size: 'large',
      };

      const serialized = new Serializer('body', {
        attributes: ['size'],
        pluralizeType: false,
      }).serialize(body);

      const expected = {
        data: {
          attributes: {
            size: 'large',
          },
          type: 'body',
        },
      };

      expect(serialized).to.deep.equal(expected);
    });
  });
});
