import SessionCandidates from 'pix-admin/components/sessions/session/session-candidates';

<template>
  <SessionCandidates
    @certificationCandidates={{@model.certificationCandidates}}
    @sessionVersion={{@model.session.version}}
  />
</template>
