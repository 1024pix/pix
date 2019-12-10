const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const studentUserAssociationController = require('../../../../lib/application/student-user-associations/student-user-association-controller');

describe('Integration | Application | Route | student-user-associations', () => {
  let server;

  beforeEach(() => {
    sinon.stub(studentUserAssociationController, 'associate').callsFake((request, h) => h.response('ok').code(204));
    sinon.stub(studentUserAssociationController, 'findAssociation').callsFake((request, h) => h.response('ok').code(200));
    server = Hapi.server();
    return server.register(require('../../../../lib/application/student-user-associations'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('POST /api/student-user-associations', () => {

    it('should succeed', () => {
      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/student-user-associations',
        payload: { data: { attributes: {
          'first-name': 'Robert',
          'last-name': 'Smith',
          birthdate: '2012-12-12',
          'campaign-code': 'CODE',
        } } },
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(204);
      });
    });

    it('should succeed when there is a space', () => {
      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/student-user-associations',
        payload: { data: { attributes: {
          'first-name': 'Robert ',
          'last-name': 'Smith',
          birthdate: '2012-12-12',
          'campaign-code': 'CODE',
        } } },
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(204);
        expect(res.request.payload.data.attributes['first-name']).to.equal('Robert ');
      });
    });

    it('should return an error when there is no payload', () => {
      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/student-user-associations',
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(422);
      });
    });

    it('should return an error when there is an invalid first name attribute in the payload', () => {
      // given
      const INVALID_FIRSTNAME = ' ';

      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/student-user-associations',
        payload: { data: { attributes: {
          'first-name': INVALID_FIRSTNAME,
          'last-name': 'Smith',
          birthdate: '2012-12-12',
          'campaign-code': 'CODE',
        } } },
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(422);
      });
    });

    it('should return an error when there is an invalid last name attribute in the payload', () => {
      // given
      const INVALID_LASTNAME = '';

      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/student-user-associations',
        payload: { data: { attributes: {
          'first-name': 'Robert',
          'last-name': INVALID_LASTNAME,
          birthdate: '2012-12-12',
          'campaign-code': 'CODE',
        } } },
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(422);
      });
    });

    it('should return an error when there is an invalid a birthdate attribute (with space) in the payload', () => {
      // given
      const INVALID_BIRTHDATE = '2012- 12-12';

      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/student-user-associations',
        payload: { data: { attributes: {
          'first-name': 'Robert',
          'last-name': 'Smith',
          birthdate: INVALID_BIRTHDATE,
          'campaign-code': 'CODE',
        } } },
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(422);
      });
    });

    it('should return an error when there is an invalid birthdate attribute (with extra zeros) in the payload', () => {
      // given
      const INVALID_BIRTHDATE = '2012-012-12';

      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/student-user-associations',
        payload: { data: { attributes: {
          'first-name': 'Robert',
          'last-name': 'Smith',
          birthdate: INVALID_BIRTHDATE,
          'campaign-code': 'CODE',
        } } },
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(422);
      });
    });

    it('should return an error when there is an invalid birthdate attribute (not a proper date) in the payload', () => {
      // given
      const INVALID_BIRTHDATE = '1999-99-99';

      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/student-user-associations',
        payload: { data: { attributes: {
          'first-name': 'Robert',
          'last-name': 'Smith',
          birthdate: INVALID_BIRTHDATE,
          'campaign-code': 'CODE',
        } } },
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(422);
      });
    });

    it('should return an error when there is an invalid campaign code attribute in the payload', () => {
      // given
      const INVALID_CAMPAIGNCODE = '';

      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/student-user-associations',
        payload: { data: { attributes: {
          'first-name': 'Robert',
          'last-name': 'Smith',
          birthdate: '2012-12-12',
          'campaign-code': INVALID_CAMPAIGNCODE,
        } } },
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(422);
      });
    });
  });

  describe('GET /api/student-user-associations', () => {

    it('should exist', () => {
      // when
      const promise = server.inject({
        method: 'GET',
        url: '/api/student-user-associations',
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });
});
