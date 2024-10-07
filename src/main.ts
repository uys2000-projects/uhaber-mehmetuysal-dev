import { getJournalScheduler, sumJournalScheduler } from "./cron/main";
import "./ulogger";

getJournalScheduler.logger();
sumJournalScheduler.logger();
