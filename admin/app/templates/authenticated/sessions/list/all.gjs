import ListItems from 'pix-admin/components/sessions/list-items';
<template>
  <ListItems
    @sessions={{@controller.model}}
    @id={{@controller.id}}
    @certificationCenterName={{@controller.certificationCenterName}}
    @certificationCenterExternalId={{@controller.certificationCenterExternalId}}
    @status={{@controller.status}}
    @onChangeSessionStatus={{@controller.updateSessionStatusFilter}}
    @certificationCenterType={{@controller.certificationCenterType}}
    @onChangeCertificationCenterType={{@controller.updateCertificationCenterTypeFilter}}
    @onChangeSessionVersion={{@controller.updateSessionVersionFilter}}
    @version={{@controller.version}}
    @triggerFiltering={{@controller.triggerFiltering}}
  />
</template>
