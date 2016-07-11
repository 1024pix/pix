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

  this.get('/assessments', (schema) => {
    return schema.assessments.all();
  });

  this.get('/assessments/:id', (schema, request) => {
    return schema.find('assessment', request.params.id);
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
