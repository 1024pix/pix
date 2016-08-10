import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';
import { describe, before, after } from 'mocha';
import Pretender from 'pretender';

describeModel(
  'course',
  'Unit | Serializer | course',
  {
    needs: ['adapter:course', 'serializer:course']
  },
  function () {

    let server;
    const airTableSheetName = 'Tests';
    const airTableResponse = {
      "records": [{
        "id": "rec5duNNrPqbSzQ8o",
        "fields": {
          "name": "Test #1",
          "id": 1,
          "description": "Libero eum excepturi occaecati sed quod veniam odit id. Et voluptas accusamus sit neque. Et ut voluptatem ut omnis. Eveniet et voluptate magni corporis dolores sapiente voluptatem.",
          "image": [
            {
              "id": "attuCagYzFRtMjciZ",
              "url": "https://dl.airtable.com/oLRaj7sTbCGzsLNwiur1_test1.png",
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
          ]
        },
        "createdTime": "2016-08-09T15:17:53.000Z"
      }]
    };

    before(() => {
      server = new Pretender(function () {
        this.get(`https://api.airtable.com/v0/appHAIFk9u1qqglhX/${airTableSheetName}`, function () {
          return [200, {"Content-Type": "application/json"}, JSON.stringify(airTableResponse)];
        });
      });
    });

    after(() => {
      server.shutdown();
    });

    describe('serializer:course', () => {

      it('can query courses from the airtable adapter', function () {
        return this.store().findAll('course').then((courses) => {
          expect(courses).to.be.ok;
        });
      });

    });
  }
);
