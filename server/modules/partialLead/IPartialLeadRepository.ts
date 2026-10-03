import { IPartialLead } from '@/server/models/PartialLead';

export interface IPartialLeadRepository {
  existsInUser(email?: string, phoneNumber?: string): Promise<boolean>;
  upsertPartialLead(data: Partial<IPartialLead>): Promise<any>;
  getPartialLeads(query: any, skip: number, limit: number): Promise<{ total: number; leads: any[] }>;
}
