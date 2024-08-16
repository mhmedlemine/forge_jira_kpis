import api, { route, storage } from "@forge/api";
import { Queue } from '@forge/events';
import { apiService, cacheAllData } from "./utils/api";
import { storageKeys } from "./constants/storageKey";

export const runScheduledReports = async () => {
  let reports = await apiService.getScheduledReports();
  console.log("resports", reports);

  const now = new Date();

  for (const report of reports) {
    if (shouldRunReport(report, now)) {
      try {
        await runReport(report);
      } catch (error) {
        console.error(`Error running scheduled report ${report.id}:`, error);
      }
    }
  }

  const lastCacheTime = await storage.get(storageKeys.LAST_CACHE_ALL_DATA_TIME_KEY);
  console.log("CACHE ALL DATA lastCacheTime", lastCacheTime)
  if (shouldRunCacheAllData(lastCacheTime)) {
    const queue = new Queue({ key: 'cache-queue' });
    await queue.push('first event');
  }
}

const shouldRunCacheAllData = async (lastCacheTime) => {
  return Date.now() - lastCacheTime > storageKeys.CACHE_ALL_DATA_TTL;
}

const shouldRunReport = (report, now) => {
  const hours = report.time;
  const reportTime = new Date(now);
  reportTime.setHours(hours, 0, 0, 0);
  console.log("now.getHours()", now.getHours());
  switch (report.frequency) {
    case "Daily":
      return now.getHours() == hours 
      //&& now.getMinutes() === minutes;
    case "Weekly":
      return (
        now.getDay() == report.weekDay &&
        now.getHours() == hours 
        //&& now.getMinutes() === minutes
      );
    case "Monthly":
      return (
        now.getDate() == report.monthDay &&
        now.getHours() == hours 
        //&& now.getMinutes() === minutes
      );
    default:
      return false;
  }
}

const runReport = async (report) => {
  console.log("report", report);
  const reportData = await apiService.generateReport(report.filters);
  const fileName = `${report.filters.reportType.replace(/\s+/g, '_')}_${new Date().toISOString()}.csv`;
  const content = convertToCSV(reportData);

  const result = await sendEmailWithAttachment(
    report.recipients,
    `Scheduled Report: ${report.name}`,
    `Please find attached the scheduled report "${report.name}".`,
    content,
    fileName
  );
  console.log("Email Sent result", result);
}

const convertToCSV = (data) => {
    if (data.length === 0) return '';

    const header = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(obj => Object.values(obj).join(','));
    return header + rows.join('\n');
};

const unicodeToBase64 = (str) => {
  if (typeof str !== 'string') {
    throw new Error(`Input is not a string, received ${typeof str}`);
  }
  return btoa(unescape(encodeURIComponent(str)));
};

const sendEmailWithAttachment = async (to, subject, text, csvContent, attachmentFilename) => {
  const backendUrl = 'https://express-redis-email.onrender.com';

  console.log("CSV Content (first 100 chars):", csvContent.substring(0, 100));

  const encodedContent = unicodeToBase64(csvContent);
  console.log("Encoded Content (first 100 chars):", encodedContent.substring(0, 100));

  try {
    const response = await api.fetch(`${backendUrl}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        text,
        attachmentContent: encodedContent,
        fileName: attachmentFilename
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.text();
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
