import PartialLead, { IPartialLead } from '@/server/models/PartialLead';
import Learner from '@/server/models/Learner';
import { IPartialLeadRepository } from './IPartialLeadRepository';

export class PartialLeadRepository implements IPartialLeadRepository {
  async existsInUser(email?: string, phoneNumber?: string): Promise<boolean> {
    const query: any[] = [];
    if (email) query.push({ email });
    if (phoneNumber) query.push({ phoneNumber });
    
    if (query.length === 0) return false;
    
    const user = await Learner.exists({ $or: query });
    return !!user;
  }

  async upsertPartialLead(data: Partial<IPartialLead>) {
    const query: any[] = [];
    if (data.email) query.push({ email: data.email });
    if (data.phoneNumber) query.push({ phoneNumber: data.phoneNumber });

    if (query.length === 0) {
        throw new Error('Email or phone number is required.');
    }

    return PartialLead.findOneAndUpdate(
      { $or: query },
      {
        $set: {
          ...(data.name && { name: data.name }),
          ...(data.email && { email: data.email }),
          ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
          ...(data.route && { route: data.route }),
          status: 'ABANDONED',
        },
      },
      { upsert: true, returnDocument: 'after', lean: true }
    );
  }

  async getPartialLeads(query: any, skip: number, limit: number) {
    const [total, leads] = await Promise.all([
      PartialLead.countDocuments(query),
      PartialLead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);
    return { total, leads };
  }
}
