import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
declare const ExcelJS: any; 
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelPdfDownloadedService {
  dataToExportExel:any[]=[];
  constructor() { }
  downLoadPdf() {
    let doc: any = new jsPDF();

    doc.save("pdf");
  }
  exportAsExcelFile() {
         this.dataToExportExel.push({
       /*     "Sr No":1,
           "Thana Name":"vaishali",
           "Zone": "zoneName",
           "Division": "division",
           "Contact No": 9562301478,
           "Email Id": "vaishali@gmail.com",
           "Incharge Name": "inchargeName",
           "Incharge Contact No":"inchargeContactNo",
           "Latitude":"latitude",
           "Longitude":"longitude",
           "Polygon Text": "polygonText",
           "Geofence Approved Status":"geofenceApprovedStatus", */
         });
         const fileName = 'GeofenceDetails' + '.xlsx';
         const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataToExportExel);
         const wb: XLSX.WorkBook = XLSX.utils.book_new();
         XLSX.utils.book_append_sheet(wb, ws, 'GeofenceDetails');
         XLSX.writeFile(wb, fileName);
       }
 
   }
 /*  const workbook = new ExcelJS.Workbook();
   workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
     const blob = new Blob([data], { type: EXCEL_TYPE });
     FileSaver.saveAs(blob, 'SocialShare.xlsx');
   }); */

