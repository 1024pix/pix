const faker = require('faker');
const bcrypt = require('bcrypt');
const { expect, knex, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | snapshot-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  let userId;
  let organizationId;
  const userPassword = bcrypt.hashSync('A124B2C3#!', 1);

  const inserted_user = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.exampleEmail().toLowerCase(),
    password: userPassword,
    cgu: true
  };

  const inserted_organization = {
    name: 'The name of the organization',
    type: 'PRO'
  };

  beforeEach(() => {
    return knex('users').insert(inserted_user).returning('id')
      .then(([id]) => {
        userId = id;
        inserted_organization.userId = id;
      })
      .then(() => knex('organizations').insert(inserted_organization).returning('id'))
      .then(([id]) => organizationId = id);
  });

  afterEach(() => {
    return knex('snapshots').delete()
      .then(() => knex('organizations').delete())
      .then(() => knex('users').delete());
  });

  describe('GET /api/organizations/{id}/snapshots', () => {
    beforeEach(() => {
      const serializedUserProfile = {
        data: {
          type: 'users',
          id: userId,
        },
      };

      const snapshotRaws = [{
        id: 1,
        organizationId: organizationId,
        testsFinished: 1,
        userId,
        score: 15,
        profile: JSON.stringify(serializedUserProfile),
        createdAt: new Date('2017-08-31T15:57:06Z')
      }, {
        id: 2,
        organizationId: organizationId,
        testsFinished: 3,
        userId,
        score: 4,
        profile: JSON.stringify(serializedUserProfile),
        createdAt: new Date('2017-06-31T15:57:06Z')
      }];

      return knex('snapshots').insert(snapshotRaws);
    });

    it('should return the paginated snapshots', () => {
      // given
      const expectedSnapshots = {
        data:
          [{
            type: 'snapshots',
            id: '1',
            attributes: {
              score: '15',
              'tests-finished': '1',
              'created-at': new Date('2017-08-31T15:57:06Z'),
              'student-code': null,
              'campaign-code': null
            },
            relationships: {
              user: {
                data: {
                  'id': userId.toString(),
                  'type': 'users'
                }
              }
            }
          }, {
            type: 'snapshots',
            id: '2',
            attributes: {
              score: '4',
              'tests-finished': '3',
              'created-at': new Date('2017-06-31T15:57:06Z'),
              'student-code': null,
              'campaign-code': null
            },
            relationships: {
              user: {
                data: {
                  'id': userId.toString(),
                  'type': 'users'
                }
              }
            }
          }],
        included: [
          {
            type: 'users',
            id: userId.toString(),
            attributes: {
              'first-name': inserted_user.firstName,
              'last-name': inserted_user.lastName,
            },
            relationships: {},
          }
        ],
        meta: {
          page: 1,
          pageCount: 1,
          pageSize: 200,
          rowCount: 2,
        }
      };
      const options = {
        method: 'GET',
        url: `/api/snapshots?filter[organizationId]=${organizationId}&page[number]=1&page[size]=200&sort=-createdAt&include=user`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedSnapshots);
      });
    });
  });
});
