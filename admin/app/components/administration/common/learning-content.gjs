import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import AdministrationBlockLayout from '../block-layout';

export default class LearningContent extends Component {
  @service notifications;
  @service store;
  @service intl;

  @action
  async refreshLearningContent() {
    try {
      await this.store.adapterFor('learning-content-cache').refreshCacheEntries();
      this.notifications.success('La demande de rechargement du cache a bien été prise en compte.');
    } catch (err) {
      const genericErrorMessage = this.intl.t('common.notifications.generic-error');
      this.notifications.error(genericErrorMessage);
    }
  }

  @action
  async createLearningContentReleaseAndRefreshCache() {
    try {
      await this.store.adapterFor('learning-content-cache').createLearningContentReleaseAndRefreshCache();
      this.notifications.success(
        'La création de la version du référentiel et le rechargement du cache a bien été prise en compte.',
      );
    } catch (err) {
      this.notifications.error('Une erreur est survenue.');
    }
  }
  <template>
    <AdministrationBlockLayout @title="Référentiel">
      <div>
        <p>Une version du référentiel de données pédagogique est créée quotidiennement (vers 4h00) et le référentiel
          utilisé par l'application est mis à jour (vers 6h00).</p>
        <p>Si le cache a été vidé, il peut s’avérer utile ou nécessaire de recharger le référentiel.</p>
        <PixMessage @type="alert" @withIcon={{true}}>
          <strong>Attention !</strong>
          Le rechargement du référentiel est une opération risquée. Il est recommandé de ne l’effectuer qu’en cas de
          force majeure, accompagné d’un développeur ou d'une développeuse.
        </PixMessage>
        <PixMessage @type="info">Durée de l’opération : <strong>≈10s</strong>.</PixMessage>

        <PixButton class="btn-refresh-cache" @triggerAction={{this.refreshLearningContent}} @iconBefore="arrows-rotate">
          Recharger le cache
        </PixButton>
        <br /><br />
        <p>Si quelque chose a été changé dans le référentiel et qu'il faut appliquer ces changements dans l'application,
          il faut créer une nouvelle version et mettre à jour le cache.</p>
        <PixMessage @type="info">Durée de l’opération : <strong>≈1mn</strong>.</PixMessage>
        <PixButton
          @triggerAction={{this.createLearningContentReleaseAndRefreshCache}}
          @variant="primary-bis"
          @iconBefore="arrows-rotate"
        >
          Créer une nouvelle version du référentiel et recharger le cache
        </PixButton>
      </div>
    </AdministrationBlockLayout>
  </template>
}
