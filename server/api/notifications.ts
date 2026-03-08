import type { PrismaClient } from "@prisma/client";

type NotificationInput = {
  userId: string;
  type: string;
  title: string;
  body: string;
  linkUrl?: string;
};

export async function createNotification(
  db: PrismaClient,
  input: NotificationInput
) {
  return db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      linkUrl: input.linkUrl ?? null,
    },
  });
}
