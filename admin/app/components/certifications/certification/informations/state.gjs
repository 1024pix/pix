import { PixBlock, PixTag } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { DescriptionList } from 'pix-admin/components/ui/description-list';

<template>
  <PixBlock @variant="admin">
    <h2 class="certification-information__title certification-information__title--state">
      État
      {{#if @certification.isPublished}}
        <PixTag @color="success">Publiée</PixTag>
      {{else}}
        <PixTag @color="info">Non publiée</PixTag>
      {{/if}}
    </h2>

    <DescriptionList data-testid="pw-certification-state-description-list">

      <DescriptionList.Item @label="Session">
        <LinkTo @route="authenticated.sessions.session" @model={{@session.id}}>
          {{@session.id}}
        </LinkTo>
      </DescriptionList.Item>

      <DescriptionList.Item @label="Certification">
        {{@certification.certificationType}}
      </DescriptionList.Item>

      <DescriptionList.Item @label="Statut">
        {{@certification.statusLabelAndValue.label}}
      </DescriptionList.Item>

      <DescriptionList.Item @label="Créée le">
        {{@certification.creationDate}}
      </DescriptionList.Item>

      <DescriptionList.Item @label="Dernière réponse le">
        {{@certification.lastAnswerDate}}
      </DescriptionList.Item>

      <DescriptionList.Item @label="Résultat">
        {{@certification.result}}
      </DescriptionList.Item>
    </DescriptionList>
  </PixBlock>
</template>
