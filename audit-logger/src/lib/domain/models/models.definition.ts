export const AuditLogActionTypes = ['ANONYMIZATION', 'ANONYMIZATION_GAR', 'EMAIL_CHANGED'] as const;
export type AuditLogAction = (typeof AuditLogActionTypes)[number];

export const AuditLogClientTypes = ['PIX_ADMIN', 'PIX_APP'] as const;
export type AuditLogClient = (typeof AuditLogClientTypes)[number];

export const AuditLogRoleTypes = ['SUPER_ADMIN', 'SUPPORT', 'USER'] as const;
export type AuditLogRole = (typeof AuditLogRoleTypes)[number];
