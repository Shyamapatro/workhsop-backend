import { ILearnerRepository } from '@/server/modules/learner/ILearnerRepository';
import {
  SignupSchema,
  LearnerDetailsQuerySchema,
} from '@/server/modules/learner/learner.validator';
import { z } from 'zod';
import UtmCampaign from '@/server/models/UtmCampaign';
import {
  getDateRangeBounds,
  formatWorkshopDateTime,
} from '@/server/utils/timezone';
import { logger } from '@/server/utils/logger';
import { WhatsappProviderFactory } from '@/server/utils/providers/whatsapp.factory';


export class LearnerService {
  constructor(private repository: ILearnerRepository) { }

  async registerLearner(
    data: z.infer<typeof SignupSchema>,
    clientIp?: string,
    userAgent?: string,
  ) {
    const existingLearner = await this.repository.findByEmailOrPhone(
      data.email,
      data.phoneNumber,
    );

    const campaignData = {
      route: data.route,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_content: data.utm_content,
      platform: data.platform,
      gclid: data.gclid,
      fbclid: data.fbclid,
      fbp: data.fbp,
      fbc: data.fbc,
      utm_term: data.utm_term,
      matchtype: data.matchtype,
      network: data.network,
      device: data.device,
      keyword: data.keyword,
      placement: data.placement,
      campaignid: data.campaignid,
      adgroupid: data.adgroupid,
      clientIp,
      userAgent,
    };

    const learnerData = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      age: data.age,
      profession: data.profession,
      marketingConsent: data.marketingConsent,
      countryCode: data.countryCode,
      timezone: data.timezone,
    };

    if (existingLearner) {
      // Multi-Touchpoint Tracking: add new campaign and update demographics
      logger.info(
        `Existing learner detected (${existingLearner.email || existingLearner.phoneNumber}), updating demographics and adding campaign`,
      );
      await this.repository.updateExistingLearner(
        existingLearner._id as any,
        learnerData,
        campaignData,
      );

      // Return the updated learner object for the response
      const updatedLearner = {
        ...existingLearner.toObject(),
        name: learnerData.name,
        age: learnerData.age,
        profession: learnerData.profession,
        marketingConsent: learnerData.marketingConsent,
      };
      return { learner: updatedLearner, status: 'existing' };
    }

    logger.info(`Creating new learner: ${data.email || data.phoneNumber}`);
    const newLearner = await this.repository.createLearner(
      learnerData,
      campaignData,
    );

    const { formattedDate, formattedDay, formattedTime } =
      formatWorkshopDateTime(data.workshopDate, data.workshopTime);

    // Send WhatsApp notification immediately via Agenda (Highest Priority)
    process.nextTick(async () => {
      try {
        const { agenda } = await import('@/server/config/agenda');
        await agenda.now('WORKSHOP_NOTIFICATION', {
          notificationType: 'welcome',
          phone: newLearner.countryCode + newLearner.phoneNumber,
          templateName: 'workshop_registration',
          params: [
            newLearner.name,
            `${formattedDate}, ${formattedDay}`, // Combines DD MMMM YYYY, dddd
            formattedTime,
            data.whatsappLink || '',
          ]
        });
        logger.info(`Queued immediate welcome message for ${newLearner.phoneNumber}`);
      } catch (err) {
        logger.error(err, 'Failed to queue welcome message');
      }
    });

    // Schedule the 2-hour delayed notification using Agenda
    process.nextTick(async () => {
      try {
        const { agenda } = await import('@/server/config/agenda');
        await agenda.schedule('in 2 hours', 'WORKSHOP_NOTIFICATION', {
          notificationType: '2hr_reminder',
          phone: newLearner.countryCode + newLearner.phoneNumber,
          templateName: 'workshop_reminder_2hr', // Use the template you configured for this
          params: [newLearner.name, data.whatsappLink || '']
        });
        logger.info(`Scheduled 2hr reminder for ${newLearner.phoneNumber}`);
      } catch (err) {
        logger.error(err, 'Failed to schedule 2hr reminder');
      }
    });

    return { learner: newLearner, status: 'new' };
  }

  async getLearnerDetails(query: z.infer<typeof LearnerDetailsQuerySchema>) {
    const { startDate, endDate, page, limit, range } = query;
    const skip = (page - 1) * limit;

    // Use timezone utility for accurate range bounding 
    const { start, end } = getDateRangeBounds(range, startDate, endDate, 'Asia/Kolkata');
    const filter: any = {
      createdAt: {
        $gte: start,
        $lte: end,
      },
    };

    logger.info(`Fetching learner details for range: ${range}, bounds: [${start.toISOString()} - ${end.toISOString()}]`);

    // Query total count and campaigns concurrently for maximum performance
    const [total, campaigns] = await Promise.all([
      UtmCampaign.countDocuments(filter),
      UtmCampaign.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'learners',
            localField: 'learnerId',
            foreignField: '_id',
            as: 'learner'
          }
        },
        { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            learnerCreatedAt: "$learner.createdAt",
            utmCreatedAt: {
              $dateToString: {
                date: "$createdAt",
                timezone: "Asia/Kolkata",
                format: "%Y-%m-%dT%H:%M:%S%z"
              }
            }
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                "$learner",
                "$$ROOT"
              ]
            }
          }
        },
        {
          $project: {
            __v: 0,
            updatedAt: 0,
            createdAt: 0,
            learnerId: 0,
            learner: 0
          }
        }
      ])
    ]);

    return {
      data: campaigns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWorkshopCommunityLink(route?: string) {
    return this.repository.getWorkshopCommunityLink(route);
  }

  async saveWorkshopCommunityLink(data: z.infer<typeof import('./learner.validator').WorkshopCommunityLinkSaveSchema>) {
    return this.repository.saveWorkshopCommunityLink(data);
  }
}
