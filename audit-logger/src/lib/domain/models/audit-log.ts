import { type AuditLogAction, type AuditLogClient, type AuditLogRole } from './models.definition.js';

export class AuditLog {
  id?: string;
  occurredAt: Date;
  action: AuditLogAction;
  userId: string;
  targetUserId: string;
  client: AuditLogClient;
  role: AuditLogRole;
  data?: Record<string, unknown> | null;
  createdAt?: Date;

  constructor({ id, occurredAt, action, userId, targetUserId, client, role, data, createdAt }: AuditLog) {
    this.id = id;
    this.occurredAt = occurredAt;
    this.action = action;
    this.userId = userId;
    this.targetUserId = targetUserId;
    this.client = client;
    this.role = role;
    this.data = data;
    this.createdAt = createdAt;
  }
}
