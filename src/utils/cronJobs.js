import cron from 'node-cron';
import { db } from '../config/db.js';
import { petReminders, notifications, pets } from '../db/schema.js';
import { eq, and, lte, gt } from 'drizzle-orm';

// Run every hour at the start of the hour
cron.schedule('0 * * * *', async () => {
    console.log("Checking for upcoming Pet Health Reminders...");
    
    try {
        const now = new Date();
        const leadTime = new Date();
        leadTime.setHours(now.getHours() + 24); // Remind 24 hours in advance

        // 1. Find unsent reminders scheduled for within the next 24 hours
        const dueReminders = await db.select({
            id: petReminders.id,
            userId: petReminders.userId,
            title: petReminders.title,
            type: petReminders.type,
            petName: pets.name
        })
        .from(petReminders)
        .leftJoin(pets, eq(petReminders.petId, pets.id))
        .where(and(
            lte(petReminders.reminderDate, leadTime),
            eq(petReminders.isSent, false)
        ));

        for (const rem of dueReminders) {
            // 2. Insert into notifications table
            await db.insert(notifications).values({
                userId: rem.userId,
                title: `${rem.type === 'vaccine' ? '💉 Vaccine' : '🏥 Vet Visit'} Reminder`,
                message: `Upcoming appointment for ${rem.petName}: ${rem.title}`,
                type: 'invite', // Blue plus icon
                isRead: false
            });

            // 3. Mark as sent so we don't notify again
            await db.update(petReminders)
                .set({ isSent: true })
                .where(eq(petReminders.id, rem.id));
        }
    } catch (e) {
        console.error("Cron Error:", e);
    }
});