import Learner, { ILearner } from '@/server/models/Learner';
import UtmCampaign from '@/server/models/UtmCampaign';
import mongoose from 'mongoose';
import { ILearnerRepository } from './ILearnerRepository';

export class LearnerRepository implements ILearnerRepository {
  async findByEmailOrPhone(email: string | undefined, phoneNumber: string): Promise<ILearner | null> {
    const conditions: any[] = [{ phoneNumber }];
    if (email) conditions.push({ email });
    return Learner.findOne({ $or: conditions });
  }

  async createLearner(learnerData: Partial<ILearner>, campaignData: any): Promise<ILearner> {
    // Prevent duplicate learners
    const conditions: any[] = [{ phoneNumber: learnerData.phoneNumber }];
    if (learnerData.email) conditions.push({ email: learnerData.email });

    const existingLearner = await Learner.findOne({ $or: conditions });
    if (existingLearner) {
      throw new Error('LEARNER_ALREADY_EXISTS');
    }

    const [learner] = await Learner.create([learnerData]);

    if (Object.keys(campaignData).length > 0) {
      await UtmCampaign.create([{ learnerId: learner._id, ...campaignData }]);
    }

    return learner;
  }

  async updateExistingLearner(learnerId: mongoose.Types.ObjectId, learnerData: Partial<ILearner>, campaignData: any) {
    if (learnerData) {
      await Learner.findByIdAndUpdate(learnerId, {
        $set: {
          name: learnerData.name,
          age: learnerData.age,
          profession: learnerData.profession,
          marketingConsent: learnerData.marketingConsent,
          countryCode: learnerData.countryCode,
          timezone: learnerData.timezone,
        }
      });
    }

    if (Object.keys(campaignData).length > 0) {
      await UtmCampaign.create([{ learnerId, ...campaignData }]);
    }

    return true;
  }
  async getWorkshopCommunityLink(route?: string): Promise<any> {
    const WorkshopCommunityLink = (await import('@/server/models/WorkshopCommunityLink')).default;
    let query: any = {};
    if (route) {
      query.route = route;
    }
    
    let link = await WorkshopCommunityLink.findOne(query).lean();
    if (!link && route) {
      // Fallback if specific route not found
      link = await WorkshopCommunityLink.findOne({}).lean();
    }
    
    return link;
  }

  async saveWorkshopCommunityLink(data: any): Promise<any> {
    const WorkshopCommunityLink = (await import('@/server/models/WorkshopCommunityLink')).default;
    
    // Upsert based on the route
    const link = await WorkshopCommunityLink.findOneAndUpdate(
      { route: data.route },
      { $set: data },
      { new: true, upsert: true }
    );
    
    return link;
  }
}
