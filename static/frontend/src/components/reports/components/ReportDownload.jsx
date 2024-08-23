import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { PictureAsPdf, TableChart, Description } from '@mui/icons-material';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';

const styles = StyleSheet.create({
    page: { padding: 30 },
    title: { fontSize: 24, marginBottom: 10 },
    table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
    tableRow: { margin: 'auto', flexDirection: 'row' },
    tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
    tableCell: { margin: 'auto', marginTop: 5, fontSize: 10 }
});

const PDFDocument = ({ reportData, reportType }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.title}>
                <Text>{reportType} Report</Text>
            </View>
            <View style={styles.table}>
                {/* Table header */}
                <View style={styles.tableRow}>
                    {Object.keys(reportData[0]).map((key) => (
                        <View style={styles.tableCol} key={key}>
                            <Text style={styles.tableCell}>{key}</Text>
                        </View>
                    ))}
                </View>
                {/* Table body */}
                {reportData.map((row, index) => (
                    <View style={styles.tableRow} key={index}>
                        {Object.values(row).map((value, valueIndex) => (
                            <View style={styles.tableCol} key={valueIndex}>
                                <Text style={styles.tableCell}>{value}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);

const ReportDownload = ({ reportData, reportType }) => {
    const downloadReport = async (format) => {
        const fileName = `${reportType.replace(/\s+/g, '_')}_${new Date().toISOString()}.${format}`;

        switch (format) {
            case 'csv':
                downloadCSV(fileName);
                break;
            case 'xlsx':
                downloadExcel(fileName);
                break;
            case 'pdf':
                await downloadPdf(fileName);
            default:
                console.error('Unsupported format');
        }
    };

    const downloadCSV = (fileName) => {
        const content = convertToCSV(reportData);
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        saveFile(blob, fileName);
    };

    const downloadExcel = (fileName) => {
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, fileName);
    };

    const downloadPdf = async (fileName) => {
        const blob = await pdf(<PDFDocument reportData={reportData} reportType={reportType} />).toBlob();
        saveFile(blob, fileName);
    };

    const convertToCSV = (data) => {
        if (data.length === 0) return '';

        const header = Object.keys(data[0]).join(',') + '\n';
        const rows = data.map(obj => Object.values(obj).join(','));
        return header + rows.join('\n');
    };

    const saveFile = (blob, fileName) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Button
                variant="contained"
                onClick={() => downloadReport('csv')}
                sx={{ mr: 1 }}
            >
                EXPORT CSV
            </Button>
            <Button
                variant="contained"
                onClick={() => downloadReport('xlsx')}
                sx={{ mr: 1 }}
            >
                Export Excel
            </Button>
            {/* <Button
                variant="contained"
                onClick={() => downloadReport('pdf')}
                sx={{ mr: 1 }}
            >
                EXPORT PDF
            </Button> */}
        </Box>
    );
}
export default ReportDownload;