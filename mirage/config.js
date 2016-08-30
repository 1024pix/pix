export default function () {
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
                "url": "https://dl.airtable.com/oLRaj7sTbCGzsLNwiur1_test1.png"
              }
            ],
            "Durée": 20,
            "Épreuves": [
              "recLt9uwa2dR3IYpi",
              "recub31NerwonPVwX"
            ]
          }
        },
        {
          "id": "recHqnPdLdXthJBY5",
          "fields": {
            "Nom": "Tests sans durée",
            "Description": "Bla bla bla",
            "Image": [
              {
                "url": "https://dl.airtable.com/p8NfvjfvRWGPJTfLsiO1_Wolverine_kawaii.jpg"
              }
            ]
          }
        },
        {
          "id": "recOouHLk00aMWJH2",
          "fields": {
            "Nom": "Test sans image",
            "Description": "Lorem ipsum dolor sit amet",
            "Durée": 25,
            "Épreuves": []
          }
        },
        {
          "id": "recgCojOs6ykwak43",
          "fields": {
            "Nom": "Test #3",
            "Description": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
            "Image": [
              {
                "url": "https://dl.airtable.com/kfH1ge2oTHCKvtkG910W_test3.png"
              }
            ],
            "Durée": 15,
            "Épreuves": []
          }
        },
        {
          "id": "recgfTczeaXYoBLpw",
          "fields": {
            "Nom": "Test sans description",
            "Image": [
              {
                "url": "https://dl.airtable.com/mrzNpuOQuKlqTCY2yL5o_Ninja_Turtles_kawaii.jpg"
              }
            ],
            "Durée": 10,
            "Épreuves": []
          }
        },
        {
          "id": "recqBFUffy0sCq6ah",
          "fields": {
            "Nom": "Test #2",
            "Description": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            "Image": [
              {
                "url": "https://dl.airtable.com/pSWiObyPT9mBCCmTH3AN_test2.png"
              }
            ],
            "Durée": 30,
            "Épreuves": []
          }
        }
      ]
    };
  });

  this.get('https://api.airtable.com/v0/appHAIFk9u1qqglhX/Tests/:id', function () {
    return {
      "id": "rec5duNNrPqbSzQ8o",
      "fields": {
        "Nom": "course_name",
        "Description": "course_description",
        "Image": [{
          "url": "https://course_image.png"
        }],
        "Durée": 20,
        "Épreuves": [
          "recLt9uwa2dR3IYpi",
          "recub31NerwonPVwX"
        ]
      }
    };
  });

  this.get('https://api.airtable.com/v0/appHAIFk9u1qqglhX/Epreuves/:id', function (_, request) {
    switch (request.params.id) {
      case "recLt9uwa2dR3IYpi":
        return {
          "id": "recLt9uwa2dR3IYpi",
          "fields": {
            "Consigne": "Que peut-on dire des œufs de catégorie A ?",
            "Propositions": "- Ils sont bio\n- Ils pèsent plus de 63 grammes\n- Ce sont des oeufs frais\n- Ils sont destinés aux consommateurs\n- Ils ne sont pas lavés\n",
            "Type d'épreuve": "QCU",
            "Tests": [
              "rec5duNNrPqbSzQ8o"
            ]
          }
        };
      case 'test_id_FIXME_remove_it':
        return {
          "id": "test_id_FIXME_remove_it",
          "fields": {
            "Consigne": "Exemple de question QCU\n\n",
            "Propositions": "- option 1\n- option 2\n- option 3\n- option 4\n- option 5\n\n",
            "Type d'épreuve": "QCU",
            "Tests": [
              "rec5duNNrPqbSzQ8o"
            ],
            "Illustration de la consigne": [
              {
                "url": "https://dl.airtable.com/SX1UCYMHQZ2ovVswb510_Tuvalu%20chif..png"
              }
            ]
          }
        };
      case "recub31NerwonPVwX":
      default:
        return {
          "id": "recub31NerwonPVwX",
          "fields": {
            "Consigne": "Exemple de question QCU\n\n",
            "Propositions": "- option 1\n- option 2\n- option 3\n- option 4\n- option 5\n\n",
            "Type d'épreuve": "QCU",
            "Tests": [
              "rec5duNNrPqbSzQ8o"
            ]
          }
        }
    }
  });

  this.get('https://api.airtable.com/v0/appHAIFk9u1qqglhX/Evaluations/:id', function (_, request) {
    return {
      "id": "recqE9kA4VRqFcEgK",
      "fields": {
        "Nom": 21,
        "Test": [
          "rec5duNNrPqbSzQ8o"
        ]
      }
    };
  });

  this.post('https://api.airtable.com/v0/appHAIFk9u1qqglhX/Evaluations', function (_, request) {
    return {
      "id": "recqE9kA4VRqFcEgK",
      "fields": {
        "Nom": 21,
        "Test": [
          "rec5duNNrPqbSzQ8o"
        ]
      }
    };
  });

}
