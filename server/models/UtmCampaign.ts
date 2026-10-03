import mongoose, { Schema, Document, Model } from 'mongoose';
import { config } from '@/server/config/env';

export interface IUtmCampaign extends Document {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  route: string;
  learnerId: mongoose.Types.ObjectId;
  platform?: string;
  gclid?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  utm_term?: string;
  matchtype?: string;
  network?: string;
  device?: string;
  keyword?: string;
  placement?: string;
  campaignid?: string;
  adgroupid?: string;
  clientIp?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UtmCampaignSchema: Schema<IUtmCampaign> = new Schema(
  {
    utm_source: { type: String, required: false, trim: true },
    utm_medium: { type: String, required: false, trim: true },
    utm_campaign: { type: String, required: false, trim: true },
    utm_content: { type: String, required: false, trim: true },
    route: { type: String, required: false, trim: true },
    learnerId: { type: Schema.Types.ObjectId, required: true, ref: 'Learner', index: true },
    platform: { type: String, required: false, trim: true },
    gclid: { type: String, required: false, trim: true },
    fbclid: { type: String, required: false, trim: true },
    fbp: { type: String, required: false, trim: true },
    fbc: { type: String, required: false, trim: true },
    utm_term: { type: String, required: false, trim: true },
    matchtype: { type: String, required: false, trim: true },
    network: { type: String, required: false, trim: true },
    device: { type: String, required: false, trim: true },
    keyword: { type: String, required: false, trim: true },
    placement: { type: String, required: false, trim: true },
    campaignid: { type: String, required: false, trim: true },
    adgroupid: { type: String, required: false, trim: true },
    clientIp: { type: String, required: false, trim: true },
    userAgent: { type: String, required: false, trim: true },
  },
  {
    timestamps: true,
    autoIndex: config.nodeEnv !== 'production',
  }
);

// Indexes for query performance
UtmCampaignSchema.index({ createdAt: -1 }); // Critical for /api/user-details range queries
UtmCampaignSchema.index({ learnerId: 1, utm_source: 1, utm_campaign: 1 });

const UtmCampaign: Model<IUtmCampaign> =
  mongoose.models.UtmCampaign || mongoose.model<IUtmCampaign>('UtmCampaign', UtmCampaignSchema, 'utm_campaigns');

export default UtmCampaign;
