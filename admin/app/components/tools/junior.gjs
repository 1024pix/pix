import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { createMermaidFlowchartLink } from '../../utils/create-tree-data';

export default class ToolsJunior extends Component {
  @tracked juniorMermaidFlowchart;

  @action
  displayTree([file]) {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => this._onFileLoad(event));
    reader.readAsText(file);
  }

  _onFileLoad(event) {
    const data = JSON.parse(event.target.result);
    this.juniorMermaidFlowchart = createMermaidFlowchartLink(data);
  }

  <template>
    <section class="page-section">
      <header class="page-section__header">
        <h2 class="page-section__title">Afficher un arbre de passage de missions Pix Junior</h2>
      </header>
      <PixNotificationAlert class="tools__warning" @type="warning" @withIcon={{true}}>
        Cette fonctionnalité est un POC destiné à l'analyse des résultats de passage Pix Junior.<br />
        Elle permet de visualiser les résultats d'une question Metabase sous la forme d'un arbre sur le site
        <a href="https://mermaid.live/">https://mermaid.live/</a>
      </PixNotificationAlert>
      <PixNotificationAlert class="tools__info" @type="info" @withIcon={{true}}>
        <strong>Mode d'emploi</strong>
        <ol>
          <li>1. Exécuter la question Metabase
            <a
              href="https://metabase.pix.fr/question/14059-chemins-des-eleves"
              target="_blank"
              rel="noreferrer noopener"
            >Chemin des élèves</a>
            avec les paramètres souhaités.
          </li>
          <li>2. Télécharger les résultats au format json.</li>
          <li>3. Envoyer le fichier json grace au bouton ci-dessous.</li>
          <li>4. À l'aide du lien généré, accéder à la représentation graphique de l'arbre de résultats.</li>
        </ol>
      </PixNotificationAlert>
      <PixButtonUpload @id="json-file-upload" @onChange={{this.displayTree}} accept=".json">
        Envoyer le fichier des chemins Pix Junior
      </PixButtonUpload>
      {{#if this.juniorMermaidFlowchart}}
        <a href={{this.juniorMermaidFlowchart}} target="_blank" rel="noreferrer noopener">
          Lien vers l'arbre de passage de missions.
        </a>
      {{/if}}
    </section>
  </template>
}
