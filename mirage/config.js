import _ from 'lodash/lodash';

function pickChallengesAtRandom(schema, nbOfChallenges) {
  return _.range(1, nbOfChallenges).map((number) => {
    const challenges = schema.challenges.where({ number }).models;
    const randomIndex = _.random(0, (challenges.length - 1));
    const challenge = challenges[randomIndex];
    return challenge.id;
  });
}

export default function () {

  this.get('/courses/:id');
  this.post('/assessments', function (schema) {
    const payload = this.normalizedRequestAttrs();
    const challengeIds = pickChallengesAtRandom(schema, 5);
    return schema.assessments.create({ course: schema.courses.find(payload.course), challengeIds });
  });
  this.get('/assessments/:id');
  this.get('/assessments/:id/challenges', function (schema, request) {
    return schema.challenges.where({ assessmentId: request.params.id });
  });
  this.get('/challenges/:id');

  this.passthrough('https://api.airtable.com/**');

}

export function testConfig() {
  this.get('https://api.airtable.com/v0/appHAIFk9u1qqglhX/Tests', function () {
    return {
      "records": [
        {
          "id": "rec5duNNrPqbSzQ8o",
          "fields": {
            "Nom": "Test #1",
            "Description": "Libero eum excepturi occaecati sed quod veniam odit id. Et voluptas accusamus sit neque. Et ut voluptatem ut omnis. Eveniet et voluptate magni corporis dolores sapiente voluptatem.",
            "Image": [
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
            ],
            "Durée": 20
          },
          "createdTime": "2016-08-09T15:17:53.000Z"
        },
        {
          "id": "recHqnPdLdXthJBY5",
          "fields": {
            "Nom": "Tests sans durée",
            "Description": "Bla bla bla",
            "Image": [
              {
                "id": "attvYECSzpchqiYa9",
                "url": "https://dl.airtable.com/p8NfvjfvRWGPJTfLsiO1_Wolverine_kawaii.jpg",
                "filename": "Wolverine_kawaii.jpg",
                "size": 122094,
                "type": "image/jpeg",
                "thumbnails": {
                  "small": {
                    "url": "https://dl.airtable.com/URbFhHwxRYGy3UN71bhA_small_Wolverine_kawaii.jpg",
                    "width": 36,
                    "height": 36
                  },
                  "large": {
                    "url": "https://dl.airtable.com/8O0oN8iYT5gtTavtSVvg_large_Wolverine_kawaii.jpg",
                    "width": 500,
                    "height": 500
                  }
                }
              }
            ]
          },
          "createdTime": "2016-08-11T13:48:28.221Z"
        },
        {
          "id": "recOouHLk00aMWJH2",
          "fields": {
            "Nom": "Test sans image",
            "Description": "Lorem ipsum dolor sit amet",
            "Durée": 25
          },
          "createdTime": "2016-08-11T08:59:51.000Z"
        },
        {
          "id": "recgCojOs6ykwak43",
          "fields": {
            "Nom": "Test #3",
            "Description": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
            "Image": [
              {
                "id": "attjEQyQht6zRytuc",
                "url": "https://dl.airtable.com/kfH1ge2oTHCKvtkG910W_test3.png",
                "filename": "test3.png",
                "size": 72436,
                "type": "image/png",
                "thumbnails": {
                  "small": {
                    "url": "https://dl.airtable.com/VSHtJEr0TsOGNk093svJ_small_test3.png",
                    "width": 56,
                    "height": 36
                  },
                  "large": {
                    "url": "https://dl.airtable.com/yzxmbzMQJW3d6MqaPgwX_large_test3.png",
                    "width": 500,
                    "height": 324
                  }
                }
              }
            ],
            "Durée": 15
          },
          "createdTime": "2016-08-09T15:17:53.000Z"
        },
        {
          "id": "recgfTczeaXYoBLpw",
          "fields": {
            "Nom": "Test sans description",
            "Image": [
              {
                "id": "atthKQGve2bSn6xgv",
                "url": "https://dl.airtable.com/mrzNpuOQuKlqTCY2yL5o_Ninja_Turtles_kawaii.jpg",
                "filename": "Ninja_Turtles_kawaii.jpg",
                "size": 48064,
                "type": "image/jpeg",
                "thumbnails": {
                  "small": {
                    "url": "https://dl.airtable.com/u5SZ9pcYQTCbyCKUGQM1_small_Ninja_Turtles_kawaii.jpg",
                    "width": 56,
                    "height": 36
                  },
                  "large": {
                    "url": "https://dl.airtable.com/QYGBBJMxRmyoUQ39tvfY_large_Ninja_Turtles_kawaii.jpg",
                    "width": 512,
                    "height": 395
                  }
                }
              }
            ],
            "Durée": 10
          },
          "createdTime": "2016-08-11T13:47:51.658Z"
        },
        {
          "id": "recqBFUffy0sCq6ah",
          "fields": {
            "Nom": "Test #2",
            "Description": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            "Image": [
              {
                "id": "attRAWHK5rpge3l7O",
                "url": "https://dl.airtable.com/pSWiObyPT9mBCCmTH3AN_test2.png",
                "filename": "test2.png",
                "size": 119119,
                "type": "image/png",
                "thumbnails": {
                  "small": {
                    "url": "https://dl.airtable.com/ehK9hFDCS0elu41z7wHk_small_test2.png",
                    "width": 49,
                    "height": 36
                  },
                  "large": {
                    "url": "https://dl.airtable.com/VQgDQ8M3T9CidPTp5lZI_large_test2.png",
                    "width": 500,
                    "height": 365
                  }
                }
              }
            ],
            "Durée": 30
          },
          "createdTime": "2016-08-09T15:17:53.000Z"
        }
      ]
    };
  });
  this.get(encodeURI('https://api.airtable.com/v0/appHAIFk9u1qqglhX/Epreuves/:id'), function () {
    return {
      "id": "recLt9uwa2dR3IYpi",
      "fields": {
        "Consigne": "Que peut-on dire des œufs de catégorie A ?",
        "description": "catégorie oeuf",
        "Propositions QCU / QCM": "- Ils sont bio\n- Ils pèsent plus de 63 grammes\n- Ce sont des oeufs frais\n- Ils sont destinés aux consommateurs\n- Ils ne sont pas lavés\n",
        "Type d'épreuve": "QCU"
      },
      "createdTime": "2016-08-09T15:17:53.000Z"
    };
  });
}
