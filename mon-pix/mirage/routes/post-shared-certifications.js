import { Response } from 'miragejs';

export default function (schema, request) {
  const params = JSON.parse(request.requestBody);
  if (params.verificationCode === 'P-12345678') {
    return new Response(404);
  } else if (params.verificationCode === 'P-V3V3V3V3') {
    return certificationResponse({ version: 3 });
  } else {
    return certificationResponse({ version: 2 });
  }
}

function certificationResponse({ version }) {
  return {
    included: competences,
    data: {
      type: 'certifications',
      id: '200',
      attributes: {
        'certification-center': 'Centre SCO des Anne-Étoiles',
        birthdate: '2000-01-01',
        birthplace: 'Monroeberg',
        date: '2020-01-31T00:00:00.000Z',
        'first-name': 'anne',
        'delivered-at': '2020-06-05T15:00:34.000Z',
        'is-published': true,
        'last-name': 'success',
        status: 'validated',
        'pix-score': 518,
        'clea-certification-status': 'acquired',
        'certified-badge-images': [],
        version,
      },
      relationships: {
        'result-competence-tree': {
          data: {
            type: 'result-competence-trees',
            id: '200-104537',
          },
        },
      },
    },
  };
}

const competences = [
  {
    type: 'result-competences',
    id: 'rec6rHqas39zvLZep',
    attributes: {
      index: '4.1',
      level: 5,
      name: "Sécuriser l'environnement numérique",
      score: 40,
    },
  },
  {
    type: 'result-competences',
    id: 'recofJCxg0NqTqTdP',
    attributes: {
      index: '4.2',
      level: -1,
      name: 'Protéger les données personnelles et la vie privée',
      score: 0,
    },
  },
  {
    type: 'result-competences',
    id: 'recfr0ax8XrfvJ3ER',
    attributes: {
      index: '4.3',
      level: 5,
      name: "Protéger la santé, le bien-être et l'environnement",
      score: 40,
    },
  },
  {
    type: 'areas',
    id: 'recUcSnS2lsOhFIeE',
    attributes: {
      code: '4',
      name: '4. Protection et sécurité',
      title: 'Protection et sécurité',
      color: 'wild-strawberry',
    },
    relationships: {
      'result-competences': {
        data: [
          {
            type: 'result-competences',
            id: 'rec6rHqas39zvLZep',
          },
          {
            type: 'result-competences',
            id: 'recofJCxg0NqTqTdP',
          },
          {
            type: 'result-competences',
            id: 'recfr0ax8XrfvJ3ER',
          },
        ],
      },
    },
  },
  {
    type: 'result-competences',
    id: 'recIhdrmCuEmCDAzj',
    attributes: {
      index: '5.1',
      level: 5,
      name: 'Résoudre des problèmes techniques',
      score: 40,
    },
  },
  {
    type: 'result-competences',
    id: 'recudHE5Omrr10qrx',
    attributes: {
      index: '5.2',
      level: 4,
      name: 'Construire un environnement numérique',
      score: 39,
    },
  },
  {
    type: 'areas',
    id: 'recnrCmBiPXGbgIyQ',
    attributes: {
      code: '5',
      name: '5. Environnement numérique',
      title: 'Environnement numérique',
      color: 'butterfly-bush',
    },
    relationships: {
      'result-competences': {
        data: [
          {
            type: 'result-competences',
            id: 'recIhdrmCuEmCDAzj',
          },
          {
            type: 'result-competences',
            id: 'recudHE5Omrr10qrx',
          },
        ],
      },
    },
  },
  {
    type: 'result-competences',
    id: 'recDH19F7kKrfL3Ii',
    attributes: {
      index: '2.1',
      level: 5,
      name: 'Interagir',
      score: 40,
    },
  },
  {
    type: 'result-competences',
    id: 'recgxqQfz3BqEbtzh',
    attributes: {
      index: '2.2',
      level: 3,
      name: 'Partager et publier',
      score: 26,
    },
  },
  {
    type: 'result-competences',
    id: 'recMiZPNl7V1hyE1d',
    attributes: {
      index: '2.3',
      level: 5,
      name: 'Collaborer',
      score: 40,
    },
  },
  {
    type: 'result-competences',
    id: 'recFpYXCKcyhLI3Nu',
    attributes: {
      index: '2.4',
      level: 4,
      name: "S'insérer dans le monde numérique",
      score: 36,
    },
  },
  {
    type: 'areas',
    id: 'recoB4JYOBS1PCxhh',
    attributes: {
      code: '2',
      name: '2. Communication et collaboration',
      title: 'Communication et collaboration',
      color: 'emerald',
    },
    relationships: {
      'result-competences': {
        data: [
          {
            type: 'result-competences',
            id: 'recDH19F7kKrfL3Ii',
          },
          {
            type: 'result-competences',
            id: 'recgxqQfz3BqEbtzh',
          },
          {
            type: 'result-competences',
            id: 'recMiZPNl7V1hyE1d',
          },
          {
            type: 'result-competences',
            id: 'recFpYXCKcyhLI3Nu',
          },
        ],
      },
    },
  },
  {
    type: 'result-competences',
    id: 'recOdC9UDVJbAXHAm',
    attributes: {
      index: '3.1',
      level: 5,
      name: 'Développer des documents textuels',
      score: 40,
    },
  },
  {
    type: 'result-competences',
    id: 'recbDTF8KwupqkeZ6',
    attributes: {
      index: '3.2',
      level: -1,
      name: 'Développer des documents multimedia',
      score: 0,
    },
  },
  {
    type: 'result-competences',
    id: 'recHmIWG6D0huq6Kx',
    attributes: {
      index: '3.3',
      level: 5,
      name: 'Adapter les documents à leur finalité',
      score: 40,
    },
  },
  {
    type: 'result-competences',
    id: 'rece6jYwH4WEw549z',
    attributes: {
      index: '3.4',
      level: 2,
      name: 'Programmer',
      score: 17,
    },
  },
  {
    type: 'areas',
    id: 'recs7Gpf90ln8NCv7',
    attributes: {
      code: '3',
      name: '3. Création de contenu',
      title: 'Création de contenu',
      color: 'cerulean',
    },
    relationships: {
      'result-competences': {
        data: [
          {
            type: 'result-competences',
            id: 'recOdC9UDVJbAXHAm',
          },
          {
            type: 'result-competences',
            id: 'recbDTF8KwupqkeZ6',
          },
          {
            type: 'result-competences',
            id: 'recHmIWG6D0huq6Kx',
          },
          {
            type: 'result-competences',
            id: 'rece6jYwH4WEw549z',
          },
        ],
      },
    },
  },
  {
    type: 'result-competences',
    id: 'recsvLz0W2ShyfD63',
    attributes: {
      index: '1.1',
      level: 5,
      name: 'Mener une recherche et une veille d’information',
      score: 40,
    },
  },
  {
    type: 'result-competences',
    id: 'recIkYm646lrGvLNT',
    attributes: {
      index: '1.2',
      level: 5,
      name: 'Gérer des données',
      score: 40,
    },
  },
  {
    type: 'result-competences',
    id: 'recNv8qhaY887jQb2',
    attributes: {
      index: '1.3',
      level: 5,
      name: 'Traiter des données',
      score: 40,
    },
  },
  {
    type: 'areas',
    id: 'recvoGdo7z2z7pXWa',
    attributes: {
      code: '1',
      name: '1. Information et données',
      title: 'Information et données',
      color: 'jaffa',
    },
    relationships: {
      'result-competences': {
        data: [
          {
            type: 'result-competences',
            id: 'recsvLz0W2ShyfD63',
          },
          {
            type: 'result-competences',
            id: 'recIkYm646lrGvLNT',
          },
          {
            type: 'result-competences',
            id: 'recNv8qhaY887jQb2',
          },
        ],
      },
    },
  },
  {
    type: 'result-competence-trees',
    id: '200-104537',
    attributes: {
      id: '200-104537',
    },
    relationships: {
      areas: {
        data: [
          {
            type: 'areas',
            id: 'recUcSnS2lsOhFIeE',
          },
          {
            type: 'areas',
            id: 'recnrCmBiPXGbgIyQ',
          },
          {
            type: 'areas',
            id: 'recoB4JYOBS1PCxhh',
          },
          {
            type: 'areas',
            id: 'recs7Gpf90ln8NCv7',
          },
          {
            type: 'areas',
            id: 'recvoGdo7z2z7pXWa',
          },
        ],
      },
    },
  },
];
