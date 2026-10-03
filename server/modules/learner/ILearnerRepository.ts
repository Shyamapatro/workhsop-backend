import { ILearner } from '@/server/models/Learner';
import mongoose from 'mongoose';

export interface ILearnerRepository {
  findByEmailOrPhone(email: string | undefined, phoneNumber: string): Promise<ILearner | null>;
  createLearner(learnerData: Partial<ILearner>, campaignData: any): Promise<ILearner>;
  updateExistingLearner(learnerId: mongoose.Types.ObjectId, learnerData: Partial<ILearner>, campaignData: any): Promise<boolean>;
  getWorkshopCommunityLink(route?: string): Promise<any>;
  saveWorkshopCommunityLink(data: any): Promise<any>;
}
