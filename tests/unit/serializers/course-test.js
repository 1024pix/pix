import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';
import { describe, before, after } from 'mocha';
import Pretender from 'pretender';

describeModel(
  'course',
  'Unit | Serializer | Course',
  {
    needs: ['adapter:course', 'serializer:course']
  },
  function () {

    let server;
    const airTableSheetName = 'Tests';
    let airTableResponse = {
      "records": [{
        "id": "rec5duNNrPqbSzQ8o",
        "fields": {
          "Nom": "Nom du test",
          "Description": "Description du test",
          "Image": [
            {
              "id": "attuCagYzFRtMjciZ",
              "url": "https://test.image.png",
              "filename": "test1.png",
              "size": 81948,
              "type": "image/png",
              "thumbnails": {
                "small": {
                  "url": "https://dl.airtable.com/GbJKDkkCTP6xVjmrgsEr_small_test1.png",
                  "width": 53,
                  "height": 36
                },
                "large": {
                  "url": "https://dl.airtable.com/AikVbSPbROiK5apOrj0u_large_test1.png",
                  "width": 500,
                  "height": 338
                }
              }
            }
          ],
          "Durée": 20
        },
        "createdTime": "2016-08-09T15:17:53.000Z"
      }]
    };

    before(() => {
      server = new Pretender(function () {
        this.get(`https://api.airtable.com/v0/appHAIFk9u1qqglhX/${airTableSheetName}`, function () {
          return [200, { "Content-Type": "application/json" }, JSON.stringify(airTableResponse)];
        });
      });
    });

    after(() => {
      server.shutdown();
    });

    describe('serializer:course', () => {

      it('convertie la colonne "Nom" en attribut "name" pour le modèle Course', function () {
        return this.store().findAll('course').then((people) => {
          expect(people.get('firstObject.name')).to.eq('Nom du test');
        });
      });

      it('convertie la colonne "Description" en attribut "description" pour le modèle Course', function () {
        return this.store().findAll('course').then((people) => {
          expect(people.get('firstObject.description')).to.eq('Description du test');
        });
      });

      it('convertie la colonne "Image" en attribut "imageUrl" pour le modèle Course', function () {
        return this.store().findAll('course').then((people) => {
          expect(people.get('firstObject.imageUrl')).to.eq('https://test.image.png');
        });
      });

      it('convertie la colonne "Durée" en attribut "duration" pour le modèle Course', function () {
        return this.store().findAll('course').then((people) => {
          expect(people.get('firstObject.duration')).to.eq(20);
        });
      });

      it('gère le cas où aucune image n\'a été spécifiée par le contributeur', function () {
        airTableResponse = {
          "records": [{
            "id": "rec5duNNrPqbSzQ8o",
            "fields": {
              "Nom": "Nom du test",
              "Description": "Description du test",
              "Duration": 20
            }
          }],
          "createdTime": "2016-08-09T15:17:53.000Z"
        };
        return this.store().findAll('course').then((people) => {
          expect(people.get('firstObject.imageUrl')).to.be.undefined;
        });
      });

    });
  }
);
