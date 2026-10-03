import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemConfig extends Document {
  configKey: string;
  whatsappProvider: string;
}

const SystemConfigSchema: Schema = new Schema({
  configKey: { type: String, required: true, unique: true },
  whatsappProvider: { type: String, required: true, default: 'aisensy' }
}, {
  timestamps: true,
  collection: 'system_configs'
});

export default mongoose.models.SystemConfig || mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
