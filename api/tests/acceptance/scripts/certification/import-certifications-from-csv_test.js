import { expect, nock } from '../../../test-helper';
import script from '../../../../scripts/certification/import-certifications-from-csv';

describe('Acceptance | Scripts | import-certifications-from-csv.js', function () {
  describe('#assertFileValidity', function () {
    it('should throw an error when file does not exist', function () {
      // given
      const filePath = 'inexistant.file';
      const err = { code: 'ENOENT' };

      try {
        // when
        script.assertFileValidity(err, filePath);

        // then
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        expect(err.message).to.equal('File not found inexistant.file');
      }
    });

    it('should throw an error when file extension is not ".csv"', function () {
      // given
      const filePath = `${__dirname}/file_with_bad_extension.html`;
      const err = { code: 'random error' };

      try {
        // when
        script.assertFileValidity(err, filePath);

        // then
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        expect(err.message).to.equal('File extension not supported .html');
      }
    });

    it('should return true if file is valid', function () {
      // given
      const filePath = `${__dirname}/valid-certifications-test-file.csv`;
      const err = {};

      // when
      const result = script.assertFileValidity(err, filePath);

      // then
      expect(result).to.be.true;
    });
  });

  describe('#convertCSVDataIntoCertifications', function () {
    it('should return an array of certifications (JSON) object', function () {
      // given
      const csvParsingResult = {
        data: [
          {
            'ID de certification': '1',
            'ID de session': '1000',
            'Prenom du candidat': 'Tony',
            'Nom du candidat': 'Stark',
            'Date de naissance du candidat': '29/05/1970',
            'Lieu de naissance du candidat': 'Long Island, New York',
            'Identifiant Externe': '',
          },
          {
            'ID de certification': '2',
            'ID de session': '1000',
            'Prenom du candidat': 'Steven',
            'Nom du candidat': 'Rogers',
            'Date de naissance du candidat': '04/07/1918',
            'Lieu de naissance du candidat': 'New York, New York',
            'Identifiant Externe': 'GendarmeId',
          },
          {
            'ID de certification': '3',
            'ID de session': '1000',
            'Prenom du candidat': 'James',
            'Nom du candidat': 'Howlett',
            'Date de naissance du candidat': '17/04/1882',
            'Lieu de naissance du candidat': 'Alberta',
            'Identifiant Externe': 'numero eleve',
          },
        ],
      };
      const expectedCertifications = [
        {
          id: 1,
          firstName: 'Tony',
          lastName: 'Stark',
          birthdate: '29/05/1970',
          birthplace: 'Long Island, New York',
          externalId: '',
        },
        {
          id: 2,
          firstName: 'Steven',
          lastName: 'Rogers',
          birthdate: '04/07/1918',
          birthplace: 'New York, New York',
          externalId: 'GendarmeId',
        },
        {
          id: 3,
          firstName: 'James',
          lastName: 'Howlett',
          birthdate: '17/04/1882',
          birthplace: 'Alberta',
          externalId: 'numero eleve',
        },
      ];

      // when
      const certifications = script.convertCSVDataIntoCertifications(csvParsingResult);

      // then
      expect(certifications).to.deep.equal(expectedCertifications);
    });
  });

  describe('#saveCertifications', function () {
    let options;

    beforeEach(function () {
      options = {
        baseUrl: 'http://localhost:3000',
        accessToken: 'coucou-je-suis-un-token',
        certifications: [],
      };
    });

    it('should not do any http request, when there is no certification', function () {
      // given
      options.certifications = [];

      // when
      const promise = script.saveCertifications(options);

      // then
      // Nock will throw an error if there is an http connection because nock disallows http connections
      // configuration is in test-helper
      return promise;
    });

    it('should call PATCH /api/certification-courses/:id once, when there is 1 certification', function () {
      // given
      const expectedBody = {
        data: {
          type: 'certifications',
          id: 1,
          attributes: {
            'first-name': 'Tony',
            'last-name': 'Stark',
            birthplace: 'Long Island, New York',
            birthdate: '29/05/1970',
            'external-id': 'unIdExterne',
          },
        },
      };

      options.certifications = [
        {
          id: 1,
          firstName: 'Tony',
          lastName: 'Stark',
          birthdate: '29/05/1970',
          birthplace: 'Long Island, New York',
          externalId: 'unIdExterne',
        },
      ];

      const nockStub = nock('http://localhost:3000', {
        reqheaders: { authorization: 'Bearer coucou-je-suis-un-token' },
      })
        .patch('/api/certification-courses/1', function (body) {
          return JSON.stringify(body) === JSON.stringify(expectedBody);
        })
        .reply(200, {});

      // when
      const promise = script.saveCertifications(options);

      // then
      return promise.then(() => {
        expect(nockStub.isDone()).to.be.equal(true);
      });
    });

    it('should call PATCH /api/certification-courses/:id three times, when there are three certifications', function () {
      // given
      const expectedBody1 = {
        data: {
          type: 'certifications',
          id: 1,
          attributes: {
            'first-name': 'Tony',
            'last-name': 'Stark',
            birthplace: 'Long Island, New York',
            birthdate: '29/05/1970',
            'external-id': 'Id_super_heros',
          },
        },
      };
      const expectedBody2 = {
        data: {
          type: 'certifications',
          id: 2,
          attributes: {
            'first-name': 'Booby',
            'last-name': 'Gros',
            birthplace: 'Wherever, whatever',
            birthdate: '30/09/1998',
            'external-id': '',
          },
        },
      };
      const expectedBody3 = {
        data: {
          type: 'certifications',
          id: 3,
          attributes: {
            'first-name': 'Jean',
            'last-name': 'Jean',
            birthplace: 'Calais, Haut de France',
            birthdate: '11/11/1900',
            'external-id': '5',
          },
        },
      };

      options.certifications = [
        {
          id: 1,
          firstName: 'Tony',
          lastName: 'Stark',
          birthdate: '29/05/1970',
          birthplace: 'Long Island, New York',
          externalId: 'Id_super_heros',
        },
        {
          id: 2,
          firstName: 'Booby',
          lastName: 'Gros',
          birthdate: '30/09/1998',
          birthplace: 'Wherever, whatever',
          externalId: '',
        },
        {
          id: 3,
          firstName: 'Jean',
          lastName: 'Jean',
          birthdate: '11/11/1900',
          birthplace: 'Calais, Haut de France',
          externalId: '5',
        },
      ];

      const nockStub1 = nock('http://localhost:3000', {
        reqheaders: { authorization: 'Bearer coucou-je-suis-un-token' },
      })
        .patch('/api/certification-courses/1', function (body) {
          return JSON.stringify(body) === JSON.stringify(expectedBody1);
        })
        .reply(200, {});
      const nockStub2 = nock('http://localhost:3000', {
        reqheaders: { authorization: 'Bearer coucou-je-suis-un-token' },
      })
        .patch('/api/certification-courses/2', function (body) {
          return JSON.stringify(body) === JSON.stringify(expectedBody2);
        })
        .reply(200, {});
      const nockStub3 = nock('http://localhost:3000', {
        reqheaders: { authorization: 'Bearer coucou-je-suis-un-token' },
      })
        .patch('/api/certification-courses/3', function (body) {
          return JSON.stringify(body) === JSON.stringify(expectedBody3);
        })
        .reply(200, {});

      // when
      const promise = script.saveCertifications(options);

      // then
      return promise.then(() => {
        expect(nockStub1.isDone()).to.be.equal(true);
        expect(nockStub2.isDone()).to.be.equal(true);
        expect(nockStub3.isDone()).to.be.equal(true);
      });
    });

    it('should call PATCH /api/certification-courses/:id three times, even when an error occur on a certification', function () {
      // given
      const expectedBody1 = {
        data: {
          type: 'certifications',
          id: 1,
          attributes: {
            'first-name': 'Tony',
            'last-name': 'Stark',
            birthplace: 'Long Island, New York',
            birthdate: '29/05/1970',
            'external-id': 'Id_super_heros',
          },
        },
      };
      const expectedBody2 = {
        data: {
          type: 'certifications',
          id: 2,
          attributes: {
            'first-name': 'Booby',
            'last-name': 'Gros',
            birthplace: 'Wherever, whatever',
            birthdate: '30/09/1998',
            'external-id': '',
          },
        },
      };
      const expectedBody3 = {
        data: {
          type: 'certifications',
          id: 3,
          attributes: {
            'first-name': 'Jean',
            'last-name': 'Jean',
            birthplace: 'Calais, Haut de France',
            birthdate: '11/11/1900',
            'external-id': '5',
          },
        },
      };

      options.certifications = [
        {
          id: 1,
          firstName: 'Tony',
          lastName: 'Stark',
          birthdate: '29/05/1970',
          birthplace: 'Long Island, New York',
          externalId: 'Id_super_heros',
        },
        {
          id: 2,
          firstName: 'Booby',
          lastName: 'Gros',
          birthdate: '30/09/1998',
          birthplace: 'Wherever, whatever',
          externalId: '',
        },
        {
          id: 3,
          firstName: 'Jean',
          lastName: 'Jean',
          birthdate: '11/11/1900',
          birthplace: 'Calais, Haut de France',
          externalId: '5',
        },
      ];

      const nockStub1 = nock('http://localhost:3000', {
        reqheaders: { authorization: 'Bearer coucou-je-suis-un-token' },
      })
        .patch('/api/certification-courses/1', function (body) {
          return JSON.stringify(body) === JSON.stringify(expectedBody1);
        })
        .replyWithError('Error');

      const nockStub2 = nock('http://localhost:3000', {
        reqheaders: { authorization: 'Bearer coucou-je-suis-un-token' },
      })
        .patch('/api/certification-courses/2', function (body) {
          return JSON.stringify(body) === JSON.stringify(expectedBody2);
        })
        .reply(200, {});

      const nockStub3 = nock('http://localhost:3000', {
        reqheaders: { authorization: 'Bearer coucou-je-suis-un-token' },
      })
        .patch('/api/certification-courses/3', function (body) {
          return JSON.stringify(body) === JSON.stringify(expectedBody3);
        })
        .reply(200, {});

      // when
      const promise = script.saveCertifications(options);

      // then
      return promise.then(() => {
        expect(nockStub1.isDone()).to.be.equal(true);
        expect(nockStub2.isDone()).to.be.equal(true);
        expect(nockStub3.isDone()).to.be.equal(true);
      });
    });

    it(
      'should return a promise resolving to an array of objects ' +
        'containing the API error and relevant informations to find the csv row',
      function () {
        // given
        const expectedBody1 = {
          data: {
            type: 'certifications',
            id: 1,
            attributes: {
              'first-name': 'Tony',
              'last-name': 'Stark',
              birthplace: 'Long Island, New York',
              birthdate: '29/05/1970',
              'external-id': 'Id_super_heros',
            },
          },
        };
        const expectedBody2 = {
          data: {
            type: 'certifications',
            id: 2,
            attributes: {
              'first-name': 'Booby',
              'last-name': 'Gros',
              birthplace: 'Wherever, whatever',
              birthdate: '30/09/1998',
              'external-id': '',
            },
          },
        };
        const expectedBody3 = {
          data: {
            type: 'certifications',
            id: 3,
            attributes: {
              'first-name': 'Jean',
              'last-name': 'Jean',
              birthplace: 'Calais, Haut de France',
              birthdate: '11/11/1900',
              'external-id': '5',
            },
          },
        };
        const expectedErrorObjects = [
          {
            errorMessage: 'Error: Error 1',
            certification: {
              id: 1,
              firstName: 'Tony',
              lastName: 'Stark',
              birthdate: '29/05/1970',
              birthplace: 'Long Island, New York',
              externalId: 'Id_super_heros',
            },
          },
          {
            errorMessage: 'Error: Error 2',
            certification: {
              id: 2,
              firstName: 'Booby',
              lastName: 'Gros',
              birthdate: '30/09/1998',
              birthplace: 'Wherever, whatever',
              externalId: '',
            },
          },
        ];

        options.certifications = [
          {
            id: 1,
            firstName: 'Tony',
            lastName: 'Stark',
            birthdate: '29/05/1970',
            birthplace: 'Long Island, New York',
            externalId: 'Id_super_heros',
          },
          {
            id: 2,
            firstName: 'Booby',
            lastName: 'Gros',
            birthdate: '30/09/1998',
            birthplace: 'Wherever, whatever',
            externalId: '',
          },
          {
            id: 3,
            firstName: 'Jean',
            lastName: 'Jean',
            birthdate: '11/11/1900',
            birthplace: 'Calais, Haut de France',
            externalId: '5',
          },
        ];

        nock('http://localhost:3000', {
          reqheaders: { authorization: 'Bearer coucou-je-suis-un-token' },
        })
          .patch('/api/certification-courses/1', function (body) {
            return JSON.stringify(body) === JSON.stringify(expectedBody1);
          })
          .replyWithError('Error 1');

        nock('http://localhost:3000', {
          reqheaders: { authorization: 'Bearer coucou-je-suis-un-token' },
        })
          .patch('/api/certification-courses/2', function (body) {
            return JSON.stringify(body) === JSON.stringify(expectedBody2);
          })
          .replyWithError('Error 2');

        nock('http://localhost:3000', {
          reqheaders: { authorization: 'Bearer coucou-je-suis-un-token' },
        })
          .patch('/api/certification-courses/3', function (body) {
            return JSON.stringify(body) === JSON.stringify(expectedBody3);
          })
          .reply(200, {});

        // when
        const promise = script.saveCertifications(options);

        // then
        return promise.then((errorObjects) => {
          expect(errorObjects).to.be.deep.equal(expectedErrorObjects);
        });
      }
    );
  });
});
