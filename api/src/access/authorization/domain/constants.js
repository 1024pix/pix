const PIX_ADMIN = {
  NOT_ALLOWED_MSG: "Vous n'avez pas les droits pour vous connecter.",
  ROLES: {
    CERTIF: 'CERTIF',
    METIER: 'METIER',
    SUPER_ADMIN: 'SUPER_ADMIN',
    SUPPORT: 'SUPPORT',
  },
  SCOPE: 'pix-admin',
};

const PIX_ORGA = {
  NOT_LINKED_ORGANIZATION_MSG:
    "L'accès à Pix Orga est limité aux membres invités. Chaque espace est géré par un administrateur Pix Orga propre à l'organisation qui l'utilise. Contactez-le pour qu'il vous y invite.",
  SCOPE: 'pix-orga',
};

export { PIX_ADMIN, PIX_ORGA };
