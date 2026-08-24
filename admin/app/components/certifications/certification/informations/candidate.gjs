import { PixBlock, PixButton } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import formatDate from 'ember-intl/helpers/format-date';
import { DescriptionList } from 'pix-admin/components/ui/description-list';

import CandidateEditModal from '../../candidate-edit-modal';

export default class CertificationInformationCandidate extends Component {
  @service pixToast;

  @tracked isCandidateEditModalOpen = false;

  @action
  toggleCandidateEditModal() {
    this.isCandidateEditModalOpen = !this.isCandidateEditModalOpen;
  }

  @action
  async onCandidateInformationSave() {
    try {
      await this.args.certification.save({ adapterOptions: { updateJuryComment: false } });

      this.pixToast.sendSuccessNotification({ message: 'Les informations du candidat ont bien été enregistrées.' });
      this.isCandidateEditModalOpen = false;
    } catch (error) {
      if (error.errors && error.errors.length > 0) {
        error.errors.forEach((error) => {
          this.pixToast.sendErrorNotification({ message: error.detail });
        });
      } else {
        this.pixToast.sendErrorNotification({ message: error });
      }
      throw error;
    }
  }

  <template>
    <PixBlock @variant="admin" class="certification-information-candidate">
      <h2 class="certification-information__title">Candidat</h2>

      <DescriptionList>

        <DescriptionList.Item @label="Prénom">
          {{@certification.firstName}}
        </DescriptionList.Item>

        <DescriptionList.Item @label="Nom de famille">
          {{@certification.lastName}}
        </DescriptionList.Item>

        <DescriptionList.Item @label="Date de naissance">
          {{if @certification.birthdate (formatDate @certification.birthdate) ""}}
        </DescriptionList.Item>

        <DescriptionList.Item @label="Sexe">
          {{@certification.sex}}
        </DescriptionList.Item>

        <DescriptionList.Item @label="Commune de naissance">
          {{@certification.birthplace}}
        </DescriptionList.Item>

        <DescriptionList.Item @label="Code postal de naissance">
          {{@certification.birthPostalCode}}
        </DescriptionList.Item>

        <DescriptionList.Item @label="Code INSEE de naissance">
          {{@certification.birthInseeCode}}
        </DescriptionList.Item>

        <DescriptionList.Item @label="Pays de naissance">
          {{@certification.birthCountry}}
        </DescriptionList.Item>

      </DescriptionList>

      <PixButton
        @size="small"
        @triggerAction={{this.toggleCandidateEditModal}}
        aria-label="Modifier les informations du candidat"
      >
        Modifier infos candidat
      </PixButton>
    </PixBlock>

    <CandidateEditModal
      @onCancelButtonsClicked={{this.toggleCandidateEditModal}}
      @onFormSubmit={{this.onCandidateInformationSave}}
      @candidate={{@certification}}
      @isDisplayed={{this.isCandidateEditModalOpen}}
    />
  </template>
}
