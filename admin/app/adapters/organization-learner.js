import ApplicationAdapter from './application';

/**
 * 1. Créer une méthode d'adapter des orgas learners pour delete avec un payload (voir adapter orga)
 * 2. Ajouter les checkbox à orga learner list
 * 3. Ajouter le bandeau avec le bouton de suppression
 * 4. DeletionModal potentiellement à adapter (correction de la typo "vous affirmeZ")
 * 5. Au clic sur la bouton de suppression du bandeau, apparition de la DeletionModal
 * 6. Au clic sur la bouton de suppression de la modal, suppression des learners
 * 7. Vérifier que c'est bien possible que si on est admin ou support
 * 8. Faire les derniers checks du ticket jira
 */

export default class OrganizationLearnerAdapter extends ApplicationAdapter {
  urlForDeleteRecord(id, _, snapshot) {
    return `${this.host}/${this.namespace}/organizations/${snapshot.attr('organizationId')}/organization-learners/${id}`;
  }

  dissociate(id) {
    const url = `${this.host}/${this.namespace}/organization-learners/${id}/association`;
    return this.ajax(url, 'DELETE');
  }
}
