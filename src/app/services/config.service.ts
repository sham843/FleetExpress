import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

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
    apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
    language: 'en',
    libraries: ['drawing', 'places']
  };

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
      "speed":80,
      "deviceDatetime" :  "2022-01-01T10:15:50+05:30"
    },
    {
      "rowNumber": 2,
      "vehicleNo": "ZZ22ZZ2222",
      "speed":80,
      "deviceDatetime" :  "2022-01-01T10:15:50+05:30"
    },
    {
      "rowNumber": 3,
      "vehicleNo": "JK55JK5555",
      "speed":80,
      "deviceDatetime" :  "2022-01-01T10:15:50+05:30"
    },
    {
      "rowNumber": 4,
      "vehicleNo": "GH12SC8000",
      "speed":80,
      "deviceDatetime" :  "2022-01-01T10:15:50+05:30"
    },
    {
      "rowNumber": 5,
      "vehicleNo": "MH12SH2595",
      "speed":80,
      "deviceDatetime" :  "2022-01-01T10:15:50+05:30"
    },
  ]

  staticVehicleDataObj={
    'gaugeType': "arch",
    'gaugeValue' :80,
    'gaugeLabel' : "Speed",
    'gaugeAppendText' : "km/hr",
    'gaugeThick' : 15,
    'guageCap':  'round'
  }
}
