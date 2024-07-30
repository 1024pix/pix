export const AuditLogActionTypes = ['ANONYMIZATION', 'ANONYMIZATION_GAR'] as const;
export type AuditLogAction = (typeof AuditLogActionTypes)[number];
export const AuditLogClientTypes = ['PIX_ADMIN'] as const;
export type AuditLogClient = (typeof AuditLogClientTypes)[number];
export const AuditLogRoleTypes = ['SUPER_ADMIN', 'SUPPORT'] as const;
export type AuditLogRole = (typeof AuditLogRoleTypes)[number];
