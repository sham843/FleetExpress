import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  returnBaseUrl(url: string) {
    switch (url) {
      case 'fleetExpressBaseUrl': return 'https://demoapi.fleetexpress.in/fleet-express/'; break  //dev Base url
      case 'masterUrl': return 'https://aws-stpltrack-gps-inventory.mahamining.com/'; break //dev Base url

      // case 'fleetExpressBaseUrl': return 'https://vehicle-tracking.fleetexpress.in/fleet-express/'; // -- Production Base url
      default: return ''; break;
    }
  }

  dialogBoxWidth = ['320px', '800px', '700px', '1024px'];  // Set angular material dialog box width

  disableCloseBtnFlag: boolean = true// When click on body material dialog box is not closed flag

  pageSize: number = 10; // Angular material data table page size limt

  matFormField: string | any = 'legacy'; // Reactive form fill appearance

  matFormFieldFilter: string | any = 'legacy'; // Reactive form fill filter appearance

  //------------------------------------------ Maps Settings  starte heare -------------------------------------------//

  lat = 20.879865;

  long = 78.905043;

  zoom: number = 12;

  viewType: string = 'roadmap';

  static googleApiObj: object = { // google api key
    apiKey: 'AIzaSyBhkYI4LMEqVhB6ejq12wpIA6CW5theKJw',
    language: 'en',
    libraries: ['drawing', 'places']
  };


  timeConvert(time: any) {
    let t = "";
    let d = Math.floor(time / (24 * 60));
    let h = Math.floor((time % (24 * 60)) / 60);
    let m = Math.floor((time % (24 * 60)) % 60);
    t = (d ? (d + " days: ") : '') + (h ? (h + " Hrs : ") : '') + (m + ' Mints');
    return t;
  }
  fromDate!: string;
  toDate!: string;
  setFromDateTodate(timePeriod: any) {
    const currentDateTime = (moment.utc().subtract(1, 'minute')).toISOString();
    switch (timePeriod) {
      case "1":
        this.fromDate = (moment.utc().startOf('day').subtract(5, 'hour').subtract(30, 'minute')).toISOString();
        this.toDate = currentDateTime;
        break;
      case "2": var time = moment.duration("24:00:00");
        var date = moment();
        const oneDaySpan = date.subtract(time);
        this.fromDate = moment(oneDaySpan).toISOString();
        this.toDate = currentDateTime;
        break;
      case "3":
        const startweek = moment().subtract(7, 'days').calendar();
        this.fromDate = moment(startweek).toISOString();
        this.toDate = currentDateTime;
        break;
      case "4":
        this.fromDate = '';
        this.toDate = '';
        break;
    }
    const obj = {
      fromDate: this.fromDate,
      todate: this.toDate
    }
    return obj
  }

  //------------------------------------------ Maps Settings  starte heare -------------------------------------------//

  //--------------------------------------- dialog Data obj start heare ------------------------------------------//

  static dialogObj: object = {
    p1: '',
    p2: '',
    cardTitle: '',
    successBtnText: '',
    cancelBtnText: '',
    dialogIconClose: '',
    inputType: false,
    inputTypeLable: ''
  }

  // state
  stateIdSelected = 1;


  //static vehicle Array
  vehicleArray = [
    {
      "rowNumber": 1,
      "vehicleNo": "PP22PP2222",
      "speed": 80,
      "deviceDatetime": "2022-01-01T10:15:50+05:30"
    },
    {
      "rowNumber": 2,
      "vehicleNo": "ZZ22ZZ2222",
      "speed": 80,
      "deviceDatetime": "2022-01-01T10:15:50+05:30"
    },
    {
      "rowNumber": 3,
      "vehicleNo": "JK55JK5555",
      "speed": 80,
      "deviceDatetime": "2022-01-01T10:15:50+05:30"
    },
    {
      "rowNumber": 4,
      "vehicleNo": "GH12SC8000",
      "speed": 80,
      "deviceDatetime": "2022-01-01T10:15:50+05:30"
    },
    {
      "rowNumber": 5,
      "vehicleNo": "MH12SH2595",
      "speed": 80,
      "deviceDatetime": "2022-01-01T10:15:50+05:30"
    },
  ]

  staticVehicleDataObj = {
    'gaugeType': "arch",
    'gaugeValue': 80,
    'gaugeLabel': "Speed",
    'gaugeAppendText': "km/hr",
    'gaugeThick': 15,
    'guageCap': 'round'
  }
}
