import api, { route } from "@forge/api";
import { apiService } from "./utils/api";

export const runScheduledReports = async () => {
  const result = await sendEmailWithAttachment(
    'lemine39@gmail.com',
    `Scheduled Report:`,
    `Please find attached the scheduled report".`,
    '',
    'fileName'
  );
  // let reports = await apiService.getScheduledReports();

  // const now = new Date();

  // for (const report of reports) {
  //   if (shouldRunReport(report, now)) {
  //     try {
  //       await runReport(report);
  //     } catch (error) {
  //       console.error(`Error running scheduled report ${report.id}:`, error);
  //     }
  //   }
  // }
}

const shouldRunReport = (report, now) => {
  const [hours, minutes] = report.time.split(":").map(Number);
  const reportTime = new Date(now);
  reportTime.setHours(hours, minutes, 0, 0);

  switch (report.frequency) {
    case "Daily":
      return now.getHours() === hours 
      //&& now.getMinutes() === minutes;
    case "Weekly":
      return (
        now.getDay() === report.weekDay &&
        now.getHours() === hours 
        //&& now.getMinutes() === minutes
      );
    case "Monthly":
      return (
        now.getDate() === report.monthDay &&
        now.getHours() === hours 
        //&& now.getMinutes() === minutes
      );
    default:
      return false;
  }
}

const runReport = async (report) => {
  const reportData = await apiService.generateReport(report.filers);
  const fileName = `${filters.reportType.replace(/\s+/g, '_')}_${new Date().toISOString()}.csv`;
  const content = convertToCSV(reportData);


  const result = await sendEmailWithAttachment(
    report.recipients,
    `Scheduled Report: ${report.name}`,
    `Please find attached the scheduled report "${report.name}".`,
    content,
    fileName
  );
}

const convertToCSV = (data) => {
    if (data.length === 0) return '';

    const header = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(obj => Object.values(obj).join(','));
    return header + rows.join('\n');
};

const sendEmailWithAttachment = async (to, subject, text, csvContent, attachmentFilename) => {
  const backendUrl = 'https://express-redis-email.onrender.com';

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
        attachmentPath: Buffer.from(csvContent).toString('base64'),
        fileName: attachmentFilename
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.text();
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
