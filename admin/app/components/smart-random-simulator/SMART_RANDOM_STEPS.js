export const SMART_RANDOM_STEPS = {
  NO_CHALLENGE: {
    translatedName: 'Acquis sans épreuves',
    description:
      'Supprime les acquis qui ne contiennent aucun challenge ou qui ne contiennent que des challenges déjà joués dans cette évaluation',
  },
  EASY_TUBES: {
    translatedName: 'Tubes faciles',
    description:
      'Si applicable, garde seulement les tubes qui contiennent uniquement des acquis inférieurs au niveau 3',
  },
  TIMED_SKILLS: {
    translatedName: 'Épreuves chronométrées',
    description:
      "Si l'utilisateur vient de commencer ou que la précédente épreuve était chronométrée, " +
      'cette étape supprime les acquis avec une épreuve chronométré.' +
      "Ne s'applique pas si il ne reste plus que des épreuves chronométrés",
  },
  DEFAULT_LEVEL: {
    translatedName: 'Niveau par défaut',
    description:
      "Ne garde que les épreuves de niveau 2, si aucun acquis de niveau 2 n'est disponible, garde seulement les acquis de plus petit niveau. Ne se déclenche que pour la première épreuve de l'évaluation",
  },
  RANDOM_PICK: {
    translatedName: 'Choix aléatoire',
    description: 'Sélectionne un acquis au hasard parmi les acquis restants',
  },
  MAX_REWARDING_SKILLS: {
    translatedName: 'Acquis les plus lucratifs',
    description:
      'Calculés à partir de la probabilité de bonne réponse d’un utilisateur à un niveau donné ainsi que la présence d’autres acquis dans le sujet de l’acquis évalué.',
  },
  TOO_DIFFICULT: {
    translatedName: 'Acquis trop difficiles',
    description:
      'Supprime les acquis de niveau strictement supérieur à 2 par rapport au niveau estimé de l’utilisateur',
  },
  ALREADY_TESTED: {
    translatedName: 'Déjà testés',
    description: "Supprime les acquis déjà présents dans les ke de l'utilisateur",
  },
};
