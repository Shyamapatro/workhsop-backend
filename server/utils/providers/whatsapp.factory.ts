import SystemConfig from '@/server/models/SystemConfig';
import { WatiProvider } from './wati.provider';
import { AiSensyProvider } from './aisensy.provider';
import { IWhatsappProvider } from './whatsapp.types';

let cachedProviderName: string | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class WhatsappProviderFactory {
  /**
   * Retrieves the current provider from the database and returns an instantiated service.
   * Defaults to Wati if the configuration does not exist or fails.
   */
  static async getActiveProvider(): Promise<IWhatsappProvider> {
    if (process.env.WHATSAPP_PROVIDER) {
      return this.instantiateProvider(process.env.WHATSAPP_PROVIDER);
    }

    const now = Date.now();
    if (cachedProviderName && (now - lastFetchTime) < CACHE_TTL) {
      return this.instantiateProvider(cachedProviderName);
    }

    try {
      const config = await SystemConfig.findOne({ configKey: "GLOBAL_CONFIG" });
      if (config && config.whatsappProvider) {
        cachedProviderName = config.whatsappProvider;
        lastFetchTime = now;
      } else {
        cachedProviderName = "aisensy";
      }
    } catch (err) {
      console.error("Failed to fetch WhatsApp provider config from DB, defaulting to aisensy.", err);
      cachedProviderName = "aisensy";
    }

    return this.instantiateProvider(cachedProviderName!);
  }

  private static instantiateProvider(providerName: string): IWhatsappProvider {
    switch (providerName.toLowerCase()) {
      case "wati":
        return new WatiProvider();
      case "aisensy":
      default:
        return new AiSensyProvider();
    }
  }
}
