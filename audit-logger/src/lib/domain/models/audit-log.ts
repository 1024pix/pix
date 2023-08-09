import { type AuditLogAction, type AuditLogClient, type AuditLogRole } from './models.definition.js';

export class AuditLog {
  id?: string;
  occurredAt: Date;
  action: AuditLogAction;
  userId: string;
  targetUserId: string;
  client: AuditLogClient;
  role: AuditLogRole;
  createdAt?: Date;

  constructor({ id, occurredAt, action, userId, targetUserId, client, role, createdAt }: AuditLog) {
    this.id = id;
    this.occurredAt = occurredAt;
    this.action = action;
    this.userId = userId;
    this.targetUserId = targetUserId;
    this.client = client;
    this.role = role;
    this.createdAt = createdAt;
  }
}
