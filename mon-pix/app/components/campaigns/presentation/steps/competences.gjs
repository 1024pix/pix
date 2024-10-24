import PixButton from '@1024pix/pix-ui/components/pix-button';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class EvaluationResultsDetailsTab extends Component {
  getIcon(competenceId) {
    return competencesIcons[competenceId] || competencesIcons.pixplus;
  }
  <template>
    <section class="campaign-presentation-step campaign-presentation-step--competences">
      <div class="campaign-presentation-step__content">
        <div>
          <h1 class="campaign-presentation-step__title">
            {{t "pages.campaign.presentation.steps.competences.title" count=@competences.length}}
          </h1>
          <p class="campaign-presentation-step__description">
            {{t "pages.campaign.presentation.steps.competences.description"}}
          </p>
          <ul class="campaign-presentation-step__list">
            {{#each @competences as |competence|}}
              <li>
                <img src={{this.getIcon competence.id}} alt="" />
                <span>{{competence.name}}</span>
              </li>
            {{/each}}
          </ul>
          <PixButton class="campaign-presentation-step__next-button" @triggerAction={{@goToNextStep}} @size="large">
            {{t "common.actions.continue"}}
          </PixButton>
        </div>
        <img
          class="campaign-presentation-step__illustration"
          src="/images/illustrations/campaigns/presentation/step-competences.svg"
          alt=""
        />
      </div>
    </section>
  </template>
}

const ICON_DIR = '/images/icons/competences';
const competencesIcons = {
  pixplus: `${ICON_DIR}/pix-plus.svg`, // pix plus
  recsvLz0W2ShyfD63: `${ICON_DIR}/mener-une-recherche.svg`, // 1.1
  recIkYm646lrGvLNT: `${ICON_DIR}/gerer-des-donnees.svg`, // 1.2
  recNv8qhaY887jQb2: `${ICON_DIR}/traiter-des-donnees.svg`, // 1.3
  recDH19F7kKrfL3Ii: `${ICON_DIR}/interagir.svg`, // 2.1
  recgxqQfz3BqEbtzh: `${ICON_DIR}/partager-et-publier.svg`, // 2.2
  recMiZPNl7V1hyE1d: `${ICON_DIR}/collaborer.svg`, // 2.3
  recFpYXCKcyhLI3Nu: `${ICON_DIR}/inserer-dans-le-monde-numerique.svg`, // 2.4
  recOdC9UDVJbAXHAm: `${ICON_DIR}/developper-des-docs-textuels.svg`, // 3.1
  recbDTF8KwupqkeZ6: `${ICON_DIR}/developper-des-docs-multimedia.svg`, // 3.2
  recHmIWG6D0huq6Kx: `${ICON_DIR}/adapter-les-documents.svg`, // 3.3
  rece6jYwH4WEw549z: `${ICON_DIR}/programmer.svg`, // 3.4
  rec6rHqas39zvLZep: `${ICON_DIR}/securiser-environnement.svg`, // 4.1
  recofJCxg0NqTqTdP: `${ICON_DIR}/proteger-les-donnees.svg`, // 4.2
  recfr0ax8XrfvJ3ER: `${ICON_DIR}/proteger-la-sante.svg`, // 4.3
  recIhdrmCuEmCDAzj: `${ICON_DIR}/problemes-techniques.svg`, // 5.1
  recudHE5Omrr10qrx: `${ICON_DIR}/environnement-numerique.svg`, // 5.2
};
