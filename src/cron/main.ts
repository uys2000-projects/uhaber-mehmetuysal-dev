import cron from "node-cron";
import { getJournals, sumJournal } from "../bot/main";

export const getJournalScheduler = () => {
  const options = { scheduled: true, timezone: "Europe/Istanbul" };
  const task = cron.schedule("* 0 * * *", getJournals, options);
  setTimeout(() => {
    task.start();
  });
  return true;
};

export const sumJournalScheduler = () => {
  const options = { scheduled: true, timezone: "Europe/Istanbul" };
  const task = cron.schedule("* * * * *", sumJournal, options);
  setTimeout(() => {
    task.start();
  });
  return true;
};
