import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';
import Pretender from 'pretender';
import { describe, before, after } from 'mocha';

describeModel(
  'person',
  'Unit | Serializer | person',
  {
    needs: ['serializer:person']
  },
  function () {

    let server;
    const givenPayload = {
      "Prénom": "First name",
      "Nom": "Last name",
      "Image": [
        {
          "id": "attRPVHA8WQXFrny3",
          "url": "https://dl.airtable.com/f6wEsRMBQZaqv6DDjdGd_Malicia_kawaii.jpg",
          "filename": "Malicia_kawaii.jpg",
          "size": 219236,
          "type": "image/jpeg",
          "thumbnails": {
            "small": {
              "url": "https://dl.airtable.com/FYImjt8RkOFdBpnxR0FQ_small_Malicia_kawaii.jpg",
              "width": 36,
              "height": 36
            },
            "large": {
              "url": "https://dl.airtable.com/f0207UWbToKnGKSAgb3r_large_Malicia_kawaii.jpg",
              "width": 500,
              "height": 500
            }
          }
        }
      ]
    };

    before(() => {
      server = new Pretender(function () {
        this.get('/people', function () {
          const response = {
            "records": [
              {
                "id": "rec3dvmEYK2ow618L",
                "fields": givenPayload,
                "createdTime": "2016-08-10T12:05:30.794Z"
              }]
          };
          return [200, {"Content-Type": "application/json"}, JSON.stringify(response)];
        });
      });
    });

    after(() => {
      server.shutdown();
    });

    describe('serializer:person', () => {

      it('convertie la colonne "Prénom" en attribut "firstName"', function () {
        return this.store().findAll('person').then((people) => {
          expect(people.get('firstObject.firstName')).to.eq('First name');
        });
      });

      it('convertie la colonne "Nom" en attribut "lastName"', function () {
        return this.store().findAll('person').then((people) => {
          expect(people.get('firstObject.lastName')).to.eq('Last name');
        });
      });

      it('convertie la colonne "Image" en attribut "profileUrl"', function () {
        return this.store().findAll('person').then((people) => {
          expect(people.get('firstObject.profileUrl')).to.contains('.jpg');
        });
      });

    });
  });

