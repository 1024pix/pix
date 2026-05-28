/**
 * Determines the owner team(s) for a given route domain based on a mapping configuration.
 * It selects the team(s) associated with the longest prefix of the route domain present in the map.
 *
 * @param {Object.<string, string[]>} routeDomainToOwnerTeamMap - A map where keys are route domain prefixes and values are arrays of owner team ids.
 * @param {string} routeDomain - The route domain to find the owner team for.
 * @returns {string[]} An array of owner team ids. Returns an empty array if no match is found or if the map is not provided.
 *
 * @example
 * const map = {
 *   'users': ['team-identity'],
 *   'users/billing': ['team-billing'],
 *   'organizations': ['team-org', 'team-admin']
 * };
 * routeDomainToOwnerTeam(map, 'users/profile'); // returns ['team-identity']
 * routeDomainToOwnerTeam(map, 'users/billing/invoice'); // returns ['team-billing']
 */
export function routeDomainToOwnerTeam(routeDomainToOwnerTeamMap, routeDomain) {
  if (!routeDomainToOwnerTeamMap) {
    return [];
  }
  const matchingKeys = Object.entries(routeDomainToOwnerTeamMap)
    .filter(([routeDomainPattern, _value]) => routeDomain?.startsWith(routeDomainPattern))
    .map(([key, _value]) => key);

  const longestMatchingKey = matchingKeys.sort((a, b) => b.length - a.length)[0];

  return routeDomainToOwnerTeamMap[longestMatchingKey] ?? [];
}
