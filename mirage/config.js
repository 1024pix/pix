export default function () {

  this.get('/rentals', (db, request) => {

    let rentals = [{
      type: 'rentals',
      id: 1,
      attributes: {
        title: 'Grand Old Mansion',
        owner: 'Veruca Salt',
        city: 'San Francisco',
        type: 'Estate',
        bedrooms: 15,
        image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg'
      }
    }, {
      type: 'rentals',
      id: 2,
      attributes: {
        title: 'Urban Living',
        owner: 'Mike Teavee',
        city: 'Seattle',
        type: 'Condo',
        bedrooms: 1,
        image: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Alfonso_13_Highrise_Tegucigalpa.jpg'
      }
    }, {
      type: 'rentals',
      id: 3,
      attributes: {
        title: 'Downtown Charm',
        owner: 'Violet Beauregarde',
        city: 'Portland',
        type: 'Apartment',
        bedrooms: 3,
        image: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Wheeldon_Apartment_Building_-_Portland_Oregon.jpg'
      }
    }];

    if (request.queryParams.city !== undefined) {
      let filteredRentals = rentals.filter(function (i) {
        return i.attributes.city.toLowerCase().indexOf(request.queryParams.city.toLowerCase()) !== -1;
      });
      return { data: filteredRentals };
    } else {
      return { data: rentals };
    }
  });

  this.get('/assessments', () => {
    return {
      data: [{
        type: 'assessments',
        id: 1,
        attributes: {
          title: 'Assessment #1',
          description: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>',
          help: '<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>'
        },
        relationships: {
          challenges: {
            data: [{
              type: 'course',
              id: 1
            }]
          }
        }
      }, {
        type: 'assessments',
        id: 2,
        attributes: {
          title: 'Assessment #2'
        }
      }, {
        type: 'assessments',
        id: 3,
        attributes: {
          title: 'Assessment #3'
        }
      }],
      included: [{
        type: 'challenges',
        id: 1,
        attributes: {
          title: 'Epreuve #1',
          description: '<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>',
          help: '<p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>'
        }
      }, {
        type: 'challenges',
        id: 2,
        attributes: {
          title: 'Epreuve #2',
          description: '<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>',
          help: null
        }
      }, {
        type: 'challenges',
        id: 3,
        attributes: {
          title: 'Epreuve #3',
          description: '<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>',
          help: null
        }
      }]
    };
  });

  this.get('/assessments/1', () => {
    return {
      data: {
        type: 'assessments',
        id: 1,
        attributes: {
          title: 'Assessment #1',
          description: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>',
          help: '<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>'
        }
      }
    };
  });

  this.get('/tests/1/assessment', () => {

    return {
      id: 123456,
      test: {
        id: 1,
        name: "Mon premier test",
        description: "<p><b>It works!</b></p>"
      },
      challenges: [
        {
          id: 20,
          type: "MCQ",
          status: "PUBLISHED",
          statement: {
            title: "Que peut-on dire des oeufs de catégorie A ?",
            information: null,
            help: null,
            options: [
              {
                label: "Ils sont bios",
                value: "0"
              },
              {
                label: "Ils pèsent plus de 63 grammes",
                value: "1"
              },
              {
                label: "Ce sont des oeufs frais",
                value: "2"
              },
              {
                label: "Ils sont destinés aux consommateur",
                value: "3"
              },
              {
                label: "Ils ne sont pas lavés",
                value: "4"
              }
            ]
          }
        },
        {
          id: 21,
          type: "SOAQ",
          status: "PUBLISHED",
          statement: {
            title: "Cherchez un proverbe comportant les mots pomme et arbre.",
            information: null,
            help: null,
            options: null
          }
        },
        {
          id: 22,
          type: "MCQ",
          status: "PUBLISHED",
          statement: {
            title: "Quelle est la couleur du cheval Blanc d’Henri IV ?",
            information: null,
            help: "<p>La réponse attendue se trouve <a href=\"http://www.arcana-scientis.fr/quelle-est-la-couleur-du-cheval-blanc-dhenri-iv/\">sur ce site</a></p>",
            options: [
              {
                label: "Noire",
                value: "0"
              },
              {
                label: "Grise",
                value: "1"
              },
              {
                label: "Blanche",
                value: "2"
              },
              {
                label: "Crème",
                value: "3"
              },
              {
                label: "Rouge",
                value: "4"
              }
            ]
          }
        }
      ]
    };
  });

}
