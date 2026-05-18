/**
 * @typedef {Object} ImportFormatConfig
 * @property {string[]} acceptedEncoding - Encodages acceptés (ex: ['utf-8', 'iso-8859-1'])
 * @property {string[]} unicityColumns - Noms de colonnes utilisés pour vérifier l'unicité de chaque ligne
 * @property {Header[]} headers - Définition des colonnes attendues dans le fichier d'import
 */

/**
 * @typedef {Object} Header
 * @property {string} name - Nom de la colonne dans le fichier CSV (utilisé aussi comme clé dans le jsonb `attributes`)
 * @property {boolean} required - Indique si la colonne est obligatoire dans le fichier
 * @property {HeaderConfig} config - Configuration spécifique de la colonne
 */

/**
 * @typedef {Object} HeaderConfig
 * @property {'firstName'|'lastName'} [property] - Mappe la colonne sur le prénom ou le nom de l'apprenant.
 *   Exactement 2 headers doivent définir cette clé. Incompatible avec `displayable`.
 * @property {string} [mappingColumn] - Clé de stockage alternative dans `attributes` (si différente de `name`)
 * @property {Object.<string, string>} [mappingValues] - Transforme les valeurs CSV avant stockage (ex: { "3": "CYCLE III" })
 * @property {'keep'|'clear'|'generalize_date'} [anonymize] - Règle d'anonymisation appliquée à cette colonne
 * @property {boolean} [exportable] - Indique si la colonne doit être incluse dans les exports CSV
 * @property {ValidateConfig} [validate] - Règles de validation du contenu de la colonne
 * @property {DisplayableConfig} [displayable] - Paramètres d'affichage dans PixOrga (interdit si `property` est défini)
 * @property {ReconcileConfig} [reconcile] - Paramètres d'affichage dans la page de réconciliation de PixApp
 */

/**
 * @typedef {Object} ValidateConfig
 * @property {'string'|'date'} type - Type de la valeur attendue
 * @property {boolean} [required] - Indique si la valeur est obligatoire
 * @property {number} [min] - Nombre minimal de caractères (type 'string')
 * @property {number} [max] - Nombre maximal de caractères (type 'string')
 * @property {number} [length] - Longueur exacte attendue (type 'string')
 * @property {string} [regexp] - Expression régulière sous forme de chaîne (ex: '/^[0-9]+$/') (type 'string')
 * @property {string} [format] - Format attendu (ex: 'DD/MM/YYYY' pour type 'date')
 * @property {string[]} [expectedValues] - Valeurs autorisées (type 'string', uniquement sur les colonnes `required`)
 * @property {ConditionalConfig} [conditional] - Validation conditionnelle selon la valeur d'une autre colonne (type 'string')
 */

/**
 * @typedef {Object} ConditionalConfig
 * @property {string} when - Nom de la colonne dont dépend la condition
 * @property {string} is - Valeur de `when` qui déclenche la branche `then`
 * @property {StringSchemaConfig} then - Règles appliquées si la condition est vraie
 * @property {StringSchemaConfig} otherwise - Règles appliquées si la condition est fausse
 */

/**
 * @typedef {Object} StringSchemaConfig
 * @property {boolean} [required]
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [length]
 * @property {string} [regexp]
 */

/**
 * @typedef {Object} DisplayableConfig
 * @property {string} name - Clé i18n envoyée au front pour le libellé de la colonne dans PixOrga
 * @property {number} position - Ordre d'affichage parmi les colonnes supplémentaires
 * @property {FilterableConfig} [filterable] - Active le filtrage sur cette colonne
 */

/**
 * @typedef {Object} FilterableConfig
 * @property {string} type - Type de filtre envoyé au front (ex: 'string', 'list')
 */

/**
 * @typedef {Object} ReconcileConfig
 * @property {string} fieldId - Identifiant fixe du champ, utilisé comme clé dans le payload de réconciliation
 * @property {string} name - Clé i18n envoyée au front pour le libellé du champ dans PixApp
 * @property {number} position - Ordre d'affichage dans la page de réconciliation de PixApp
 */

export {};
