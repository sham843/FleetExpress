import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
declare const ExcelJS: any;
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import 'jspdf-autotable';
@Injectable({
  providedIn: 'root'
})
export class ExcelPdfDownloadedService {
  dataToExportExel: any[] = [];
  constructor(private datepipe: DatePipe) { }

  downLoadPdf(data: any, pageName: any, responseData: any) {
    let conMulArray: any;
    conMulArray = data.map((o: any) => Object.keys(o).map(k => o[k]));
    console.log(data)
    let doc: any = new jsPDF();
    let header;
    let key;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(5, 10, "From : " + this.datepipe.transform(responseData.fromDate, 'dd/MM/YYYY hh:mm a'));
    doc.text(47, 10, "To : " + this.datepipe.transform(responseData.toDate, 'dd/MM/YYYY hh:mm a'));
    doc.setFontSize(18);
    doc.text(92, 10, pageName);
    doc.setFontSize(9);
    doc.text(185, 10, "Date" + this.datepipe.transform(new Date, 'dd/MM/YYYY'));
    doc.line(5, 14, 560, 15);
    doc.text(5, 18, "Vehicle No." + responseData.VehicleNumber + "(" + responseData.vehicleName + ")");

    if (pageName == "Speed Range Report") {
      header = ["Sr No.", " Date", "Speed(Km/h)", "Address"];
      key = ['rowNumber', 'deviceDateTime', 'speed', 'address'];
    }
    else if (pageName == "Overspeed Report") {
      header = ["Sr No.", " Date", "Speed(Km/h)", "Address"];
      key = ['rowNumber', 'deviceDateTime', 'speed', 'address'];
    } 
    else if (pageName == "Address Report") {
      header = ["Sr No.", " Date", "Address"];
    } 
    else if (pageName == "Trip Report") {
      header = ["Sr No.", " Distance", "Duration", "Start Date", "Start Address", "End Date", "End Address"];
      key = ['', 'travelledDistance', 'speed', 'startDateTime','startLatLong','endDateTime','endLatLong'];
    } else {
      header = ["SrNo.", " Driver Name", "tripDurationInMins", "Veh.Type", "Running Time", "Stoppage Time", "Idle Time", "Max Speed", "Travelled Distance"];
    }
    doc.autoTable(header, conMulArray, {
      startY: 22,
      margin: { horizontal: 7 },
    });
    doc.save("pdf");
  }
  exportAsExcelFile(formData:any) {
    let key = ["Sr No."," Date","Speed(Km/h)","Address"];
    let headersArray = ['srNo', 'deviceDateTime', 'speed', 'address'];
    let formDataObj="Over Speed Report";
    let keyCenterNo = ""
    if (key.length == 2) {
      keyCenterNo = "B"
    } else {
      keyCenterNo = String.fromCharCode(Math.ceil(key.length / 2) + 64)
    }
    const header = key;
   /*  let result: any = ((obj: any) => {
      let filterObj: any = {};
      for (let i: any = 0; i < headersArray.length; i++) {
        filterObj[headersArray[i]] = obj[headersArray[i]];
      }
      return filterObj;
    }); */
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Snippet Coder';
    workbook.lastModifiedBy = 'SnippetCoder';
    workbook.created = new Date();
    workbook.modified = new Date();
    const worksheet = workbook.addWorksheet(formDataObj);
    // Adding Header Row
    worksheet.addRow([]);
    worksheet.mergeCells(keyCenterNo + '2:' + this.numToAlpha(header.length - 2) + '2');
    worksheet.getCell(keyCenterNo + '2').value = formDataObj;
    worksheet.getCell(keyCenterNo + '2').alignment = { horizontal: 'center' };
    worksheet.getCell(keyCenterNo + '2').font = { size: 15, bold: true };

    if (formDataObj == "Speed Range Report") {
      worksheet.mergeCells(keyCenterNo + '3:' + this.numToAlpha(header.length - 3) + '3');
      worksheet.getCell(keyCenterNo + '3').value = "From" + this.datepipe.transform(formData.fromDate,'ddM/MM/yyyy hh:mm a')+" "+" To : "+this.datepipe.transform(formData.toDate, 'dd-MM-YYYY hh:mm a');
      worksheet.getCell(keyCenterNo + '3').alignment = { horizontal: 'center' };
      worksheet.getCell(keyCenterNo + '3').font = { size: 12 };
    } else {
      worksheet.addRow([]);
    }
 

    //Add Header Row

    //Cell Style : Fill And Border

    const headerRow = worksheet.addRow(header);

    headerRow.eachCell((cell: any, index: any) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: 'FFFFFFFF'
        },
        bgColor: {
          argb: 'FFFFFFFF'
        },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.font = { size: 12, bold: true }
      worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;

    });
    workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
      const blob = new Blob([data], { type: EXCEL_TYPE });
      FileSaver.saveAs(blob, formDataObj + EXCEL_EXTENSION);
    });
  }


private numToAlpha(num: number) {
  let alpha = '';
  return alpha;
}
}