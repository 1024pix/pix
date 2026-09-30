import { config } from '../../../../config/config.js';

const EVERY_CONTAINER_PATTERNS = new Set(['all', '*']);
const MODULO_PATTERN = /^(?<prefix>.+)-%(?<modulo>\d+)$/;

/**
 * Traduit un motif de sélecteur en expression régulière, en ne donnant de sens
 * qu'à `*` : le reste du motif est pris littéralement.
 *
 * @param {string} pattern
 */
function patternToRegExp(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replaceAll('*', '.*')}$`);
}

/**
 * Indique si un conteneur est visé par un sélecteur.
 *
 * La grammaire reprend la nomenclature des conteneurs de Scalingo (`web-2`,
 * `worker-1`) et ajoute de quoi en viser plusieurs d'un coup :
 *
 * | sélecteur     | conteneurs visés                                |
 * | ------------- | ----------------------------------------------- |
 * | `all`, `*`    | tous                                            |
 * | `web`         | tous les conteneurs web (équivalent à `web-*`)  |
 * | `web-2`       | `web-2` uniquement                              |
 * | `web-2,web-5` | plusieurs conteneurs (virgules ou espaces)      |
 * | `web-%3`      | un conteneur web sur trois (`index % 3 === 0`)  |
 *
 * Un sélecteur vide ne vise rien : c'est le défaut sûr pour une opération
 * coûteuse qu'on ne veut jamais déclencher partout par inadvertance.
 *
 * @param {string} [selector]
 * @param {string} [containerName] nom du conteneur, `CONTAINER` sur Scalingo
 * @returns {boolean}
 */
export function matchesContainerSelector(selector, containerName = config.infra.containerName) {
  if (!selector || !containerName) return false;

  const containerIndex = Number.parseInt(containerName.split('-').at(-1), 10);

  return selector
    .split(/[\s,]+/)
    .filter(Boolean)
    .some((pattern) => {
      if (EVERY_CONTAINER_PATTERNS.has(pattern)) return true;

      const modulo = MODULO_PATTERN.exec(pattern);
      if (modulo) {
        const { prefix, modulo: divisor } = modulo.groups;
        if (!containerName.startsWith(`${prefix}-`)) return false;
        if (Number.isNaN(containerIndex)) return false;
        return Number(divisor) > 0 && containerIndex % Number(divisor) === 0;
      }

      // un motif sans tiret désigne un type de conteneur : `web` vaut `web-*`
      const containerPattern = pattern.includes('-') ? pattern : `${pattern}-*`;
      return patternToRegExp(containerPattern).test(containerName);
    });
}
