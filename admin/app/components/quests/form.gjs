import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSegmentedControl from '@1024pix/pix-ui/components/pix-segmented-control';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { objectConfigurations } from 'pix-admin/components/quests/requirements/object/object-configuration.js';

import PageTitle from '../ui/page-title';
import SnippetList from './snippets/list';

const LOCAL_STORAGE_KEY = 'QUEST_REQUIREMENT_SNIPPETS';

export default class QuestForm extends Component {
  @tracked name = '';
  @tracked rewardType = 'attestations';
  @tracked rewardId = '';
  @tracked eligibilityRequirementsStr = '';
  @tracked successRequirementsStr = '';
  @tracked switchRequirements = true;

  @service router;
  @service pixToast;

  get requirementsStr() {
    return !this.switchRequirements ? this.successRequirementsStr : this.eligibilityRequirementsStr;
  }

  get requirementState() {
    return !this.switchRequirements ? 'Succès' : 'Éligiblités';
  }

  @action
  updateName(event) {
    this.name = event.target.value;
  }

  @action
  updateRewardType(event) {
    this.rewardType = event.target.value;
  }

  @action
  updateRewardId(event) {
    this.rewardId = event.target.value;
  }

  @action
  updateRequirementsStr(event) {
    if (!this.switchRequirements) {
      this.successRequirementsStr = event.target.value;
    } else {
      this.eligibilityRequirementsStr = event.target.value;
    }
  }

  @action
  appendToRequirementsStr(str) {
    if (!this.switchRequirements) {
      this.successRequirementsStr += str;
    } else {
      this.eligibilityRequirementsStr += str;
    }
  }

  @action
  onChangeRequirements() {
    this.switchRequirements = !this.switchRequirements;
  }

  @action
  async copyEligibilityRequirementsToClipboard() {
    try {
      const snippets = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)) ?? {
        objectRequirementsByLabel: {},
      };
      const eligibilityRequirements = this.buildArrayRequirement(
        this.eligibilityRequirementsStr,
        snippets.objectRequirementsByLabel,
      );

      const successRequirements = this.buildArrayRequirement(
        this.successRequirementsStr,
        snippets.objectRequirementsByLabel,
      );

      const questToJson = JSON.stringify({
        rewardId: parseInt(this.rewardId),
        rewardType: this.rewardType,
        eligibilityRequirements: eligibilityRequirements,
        successRequirements: successRequirements,
      });

      await navigator.clipboard.writeText(questToJson);
      this.pixToast.sendSuccessNotification({
        message: 'Votre quête a été copié dans votre presse papier ou presque.',
      });
    } catch {
      this.pixToast.sendErrorNotification({ message: 'Votre quête a une erreur quelque part.' });
    }
  }

  /*
      On parcourt la chaîne de caractères. Quand on tombe sur un mot qu'on "reconnaît" on fait une action.

      Fonction inspirée des algorithmes d'évaluation d'expression arithmétique, dans notre cas la notation dite "préfixe"
      On a l'habitude de lire les expressions arithmétiques dans une notation dite "infixe" :
      x + y ---> x et y sont des opérandes, et le jeton d'opération se trouve au milieu
      En notation préfixe, ça donne ceci :
      + x y ---> le jeton d'opération se trouve au début
      En programmation, cette notation est plus facile à traiter. Il existe notamment une technique connue s'appuyant
      sur l'utilisation de piles.
      Plus d'infos : https://zanotti.univ-tln.fr/ALGO/II/Polonaise.html
      On remarquera que l'expression construite pour les requirements d'éligibilité dans le formulaire ressemble beaucoup à
      une notation "préfixe" :
      ALL(ONE-OF(A,B),C) ---> Le jeton d'opération (all ou one-of) se trouve au début, et en arguments
      on trouve la liste des opérandes.
   */
  buildArrayRequirement(str, objectRequirementsByLabel) {
    // Dictionnaire des "mots" qui correspondent à des requirements feuilles
    // qu'on pourrait retrouver dans la formule
    const snippetNames = Object.keys(objectRequirementsByLabel);
    const composeStack = [];
    let currentWord = '';
    let latestCompletedCompose;
    for (const char of str) {
      currentWord += char;
      if (currentWord === ')') {
        // Le requirement compose en cours est fini
        // On le sort de la pile et on l'ajoute dans le requirement compose juste en dessous
        if (composeStack.length > 0) {
          const stack = composeStack.at(-2);

          if (stack && stack.requirement_type === 'compose') {
            latestCompletedCompose = composeStack.pop();
            composeStack.at(-1).data.push(latestCompletedCompose);
          } else {
            latestCompletedCompose = composeStack;
          }
        }
        currentWord = '';
      } else if (currentWord === ',') {
        // à ignorer car on passe à l'opérande suivant
        currentWord = '';
      } else if (currentWord === 'all(') {
        // Initialiser un requirement compose "all" et ajouter en haut de la pile
        // Il devient le requirement compose en cours de traitement
        const composeAll = {
          requirement_type: 'compose',
          comparison: 'all',
          data: [],
        };
        composeStack.push(composeAll);
        currentWord = '';
      } else if (currentWord === 'one-of(') {
        // Initialiser un requirement compose "one-of" et ajouter en haut de la pile
        // Il devient le requirement compose en cours de traitement
        const composeOneOf = {
          requirement_type: 'compose',
          comparison: 'one-of',
          data: [],
        };
        composeStack.push(composeOneOf);
        currentWord = '';
      } else if (snippetNames.includes(currentWord)) {
        // Un opérande ! on l'ajoute au requirement compose en cours
        const requirement = objectRequirementsByLabel[currentWord];

        const formatDataQuest = objectConfigurations[requirement.requirement_type].formatRequirement(requirement);

        const stack = composeStack.at(-1);
        stack && stack.requirement_type === 'compose'
          ? composeStack.at(-1).data.push(formatDataQuest)
          : composeStack.push(formatDataQuest);
        currentWord = '';
      }
    }
    return latestCompletedCompose || composeStack;
  }

  <template>
    <PageTitle>
      <:title>Création de la quête</:title>
    </PageTitle>

    <section class="quest-object-form">
      <PixBlock @variant="admin" class="quest-button-edition">
        <PixInput onchange={{this.updateName}} required={{true}}>
          <:label>Nom de la quête</:label>
        </PixInput>
        <PixInput onchange={{this.updateRewardType}} required={{true}}>
          <:label>Type de récompense</:label>
        </PixInput>
        <PixInput onchange={{this.updateRewardId}} required={{true}}>
          <:label>ID de récompense</:label>
        </PixInput>
      </PixBlock>

      <PixBlock @variant="admin" class="quest-button-edition quest-button-edition--column">
        <PixSegmentedControl @toggled={{this.switchRequirements}} @onChange={{this.onChangeRequirements}}>
          <:label>Mes requirements :</:label>
          <:viewA>Éligibilités</:viewA>
          <:viewB>Succès</:viewB>
        </PixSegmentedControl>

        <PixTextarea value={{this.requirementsStr}} {{on "change" this.updateRequirementsStr}} rows="15">
          <:label>Mes requirements ({{this.requirementState}})</:label>
        </PixTextarea>
      </PixBlock>

      <PixBlock @variant="admin" class="quest-button-edition quest-button-edition--column">
        <h2>Créateur de condition :</h2>
        <ul class="quest-button-edition__list">
          <li>
            <PixButton @size="small" @variant="secondary" @triggerAction={{fn this.appendToRequirementsStr "all("}}>
              all(
            </PixButton>
          </li>
          <li>
            <PixButton @size="small" @variant="secondary" @triggerAction={{fn this.appendToRequirementsStr "one-of("}}>
              one-of(
            </PixButton>
          </li>
          <li>
            <PixButton @size="small" @variant="secondary" @triggerAction={{fn this.appendToRequirementsStr ")"}}>
              )
            </PixButton>
          </li>
          <li>
            <PixButton @size="small" @variant="secondary" @triggerAction={{fn this.appendToRequirementsStr ","}}>
              ,
            </PixButton>
          </li>
        </ul>

        <h2>Mes snippets :</h2>
        <SnippetList @triggerAction={{this.appendToRequirementsStr}} />
      </PixBlock>

      <div class="quest-button-edition__button">
        <PixButtonLink @route="authenticated.quest-new-or-edit-snippet" @size="small" @variant="primary">
          Créer ou modifier un snippet de requirement
        </PixButtonLink>

        <PixButton @size="small" @variant="success" @triggerAction={{this.copyEligibilityRequirementsToClipboard}}>
          Copiez le JSON de quête dans le presse-papiers
        </PixButton>
      </div>
    </section>
  </template>
}
