import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
declare const ExcelJS: any;
import { DatePipe } from '@angular/common';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import 'jspdf-autotable';
@Injectable({
  providedIn: 'root'
})
export class ExcelPdfDownloadedService {
  dataToExportExel: any[] = [];
  key: any;
  headersArray: any;
  constructor(private datepipe: DatePipe) { }
  private numToAlpha(_num: number) {
    let alpha = '';
    return alpha;
  }
  downLoadPdf(data: any, pageName: any, responseData: any) {
    let header;
    if (pageName == "Speed Range Report") {
      header = ["Sr No.", " Date","Speed(Km/h)","Address"];
      this.key = ['rowNumber', 'deviceDateTime', 'speed', 'address'];
    }
    else if (pageName == "Overspeed Report") {
      header = ["Sr No.", " Date", "Speed(Km/h)", "Address"];
      this.key = ['rowNumber', 'deviceDateTime', 'speed', 'address'];
    }
    else if (pageName == "Address Report") {
      header = ["Sr No.", " Date", "Address"];
    }
    else if (pageName == "Trip Report") {
      header = ["Sr No.", " Distance", "Duration", "Start Date", "Start Address", "End Date", "End Address"];
      this.key = ['', 'travelledDistance', 'speed', 'startDateTime', 'startLatLong', 'endDateTime', 'endLatLong'];
    } else {
      header = ["SrNo.", " Driver Name", "tripDurationInMins", "Veh.Type", "Running Time", "Stoppage Time", "Idle Time", "Max Speed", "Travelled Distance"];
    }
    let result: any = data.map((obj: any) => {
      let filterObj: any = {};
      for (let i: any = 0; i < this.key.length; i++) {
        filterObj[this.key[i]] = obj[this.key[i]];
      }
      return filterObj;
    });
    let conMulArray: any;
    conMulArray = result.map((o: any) => Object.keys(o).map(k => o[k]));
    let doc: any = new jsPDF();
    doc.setFontSize(20);
    doc.text(80, 10, pageName);
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(5, 20, "From : " + this.datepipe.transform(responseData.fromDate, 'dd/MM/YYYY hh:mm a'));
    doc.text(47, 20, "To : " + this.datepipe.transform(responseData.toDate, 'dd/MM/YYYY hh:mm a'));
    doc.text(185, 20, "Date :" + this.datepipe.transform(new Date, 'dd/MM/YYYY'));
    doc.line(5, 24, 560, 24);
    doc.text(5, 29, "Vehicle No. :" + responseData.VehicleNumber + "(" + responseData.vehicleName + ")");
    doc.autoTable(
      header, conMulArray, {
      startY: 35,
      margin: { horizontal: 7 },
    });
    doc.save("pdf");
  }
  exportAsExcelFile(data: any, formData: any, pageName: any) {
    if (pageName == "Speed Range Report") {
      this.key = ["Sr No.", " Date", "Speed(Km/h)", "Address"];
      this.headersArray = ['rowNumber', 'deviceDateTime', 'speed', 'address'];
    } else if (pageName == "Overspeed Report") {
      this.key = ["Sr No.", " Date", "Speed(Km/h)", "Address"];
      this.headersArray = ['rowNumber', 'deviceDateTime', 'speed', 'address'];
    } else if (pageName == "Address Report") {
      this.key = ["Sr No.", " Date", "Address"];
      this.headersArray = ['srNo', 'deviceDateTime', 'speed', 'address'];
    } else if (pageName == "Trip Report") {
      this.key = ["Sr No.", " Distance", "Duration", "Start Date", "Start Address", "End Date", "End Address"];
      this.headersArray = ['', 'travelledDistance', 'speed', 'startDateTime', 'startLatLong', 'endDateTime', 'endLatLong'];
    } else {
      this.key = ["SrNo.", " Driver Name", "tripDurationInMins", "Veh.Type", "Running Time", "Stoppage Time", "Idle Time", "Max Speed", "Travelled Distance"];
    }

    let keyCenterNo = ""
    if (this.key.length == 4) {
      keyCenterNo = "C"
    } else {
      keyCenterNo = String.fromCharCode(Math.ceil(this.key.length / 2) + 64)
    }
    const header = this.key;
    let result: any = data.map((obj: any) => {
      let filterObj: any = {};
      for (let i: any = 0; i < this.headersArray.length; i++) {
        filterObj[this.headersArray[i]] = obj[this.headersArray[i]];
      }
      return filterObj;
    });
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Snippet Coder';
    workbook.lastModifiedBy = 'SnippetCoder';
    workbook.created = new Date();
    workbook.modified = new Date();
    const worksheet = workbook.addWorksheet(pageName);
    // Adding Header Row
    worksheet.addRow([]);
    worksheet.mergeCells(keyCenterNo + '2:' + this.numToAlpha(header.length - 2) + '2');
    worksheet.getCell(keyCenterNo + '2').value = pageName;
    worksheet.getCell(keyCenterNo + '2').alignment = { horizontal: 'center' };
    worksheet.getCell(keyCenterNo + '2').font = { size: 15, bold: true };

    if (pageName) {
      worksheet.mergeCells(keyCenterNo + '4:' + this.numToAlpha(header.length - 3) + '4');
      worksheet.getCell(keyCenterNo + '4').value = "From : " + this.datepipe.transform(formData.fromDate, 'dd/MM/YYYY hh:mm a') + " " + " To : " + this.datepipe.transform(formData.toDate, 'dd/MM/YYYY hh:mm a');
      worksheet.getCell(keyCenterNo + '4').alignment = { horizontal: 'center' };
      worksheet.getCell(keyCenterNo + '4').font = { size: 12 };

      worksheet.mergeCells(keyCenterNo + '5:' + this.numToAlpha(header.length - 3) + '5');
      worksheet.getCell(keyCenterNo + '5').value = "Vehicle : " + formData.VehicleNumber + " (" + formData.vehicleName + ")";
      worksheet.getCell(keyCenterNo + '5').alignment = { horizontal: 'center' };
      worksheet.getCell(keyCenterNo + '5').font = { size: 12 };

      worksheet.mergeCells(keyCenterNo + '6:' + this.numToAlpha(header.length - 3) + '6');
      worksheet.getCell(keyCenterNo + '6').value = "Date : " + this.datepipe.transform(new Date, 'dd/MM/YYYY');
      worksheet.getCell(keyCenterNo + '6').alignment = { horizontal: 'center' };
      worksheet.getCell(keyCenterNo + '6').font = { size: 12 };
    } else {
      worksheet.addRow([]);
    }
    
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
      worksheet.getColumn(1).width = 10;
      worksheet.getColumn(3).width = 10;
      worksheet.getColumn(4).width = 50;
    });

    //Add Data Conditional Formating
 result.forEach((element: any) => {
      const eachRow: any = [];
      this.headersArray.forEach((column: any) => {
        eachRow.push(element[column]);
      })

// if (element.isDeleted === 'Y') {
      const deletedRow = worksheet.addRow(eachRow);
      deletedRow.eachCell((cell: any) => {
        cell.font = {
          align: 'left'
        };
        cell.alignment = {
          vertical: 'middle', horizontal: 'right'
        };
        cell.border = {
          top: { style: 'thin' },
          left: { tyle: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }); 
    })

      workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
        const blob = new Blob([data], { type: EXCEL_TYPE });
        FileSaver.saveAs(blob, pageName + EXCEL_EXTENSION);
      });
    
  }
}