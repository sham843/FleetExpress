import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ApiCallService } from './api-call.service';
import { CommonMethodsService } from './common-methods.service';
import { ErrorsService } from './errors.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  codecareerPage!: string;
  subscription!: Subscription;
  alertTypeArray = [
    {
      "alertType": "etp-missing-tracking",
      "color": "pink"
    },
    {
      "alertType": "tracking-not-found-etp",
      "color": "light-red"
    },
    {
      "alertType": "harsh-acceleration",
      "color": "cyan"
    },
    {
      "alertType": "etp-destination-not-reached",
      "color": "blue-green"
    },
    {
      "alertType": "tracking-not-consistent-etp",
      "color": "olive"
    },
    {
      "alertType": "power-connected",
      "color": "dark-voilet"
    },
    {
      "alertType": "boxopen-on",
      "color": "maroon"
    },
    {
      "alertType": "geo-in",
      "color": "magenta"
    },
    {
      "alertType": "ignition-on",
      "color": "green"
    },
    {
      "alertType": "ignition-off",
      "color": "red"
    },
    {
      "alertType": "overspeed",
      "color": "yellow"
    },
    {
      "alertType": "etp-double-trips",
      "color": "sky-blue"
    },
    {
      "alertType": "geo-out",
      "color": "voilet"
    },
    {
      "alertType": "boxopen-off",
      "color": "dark-pink"
    },
    {
      "alertType": "etp-validity-finish",
      "color": "dark-cyan"
    },
    {
      "alertType": "power-cut",
      "color": "orange"
    },
    {
      "alertType": "etp-destination-reached",
      "color": "brinjal"
    }
  ];

  private theme = new BehaviorSubject('');
  getTheme() {
    return this.theme.asObservable();
  }
  setTheme(color: any) {
    this.theme.next(color);
  }


  constructor(private commonMethods: CommonMethodsService,
    private error: ErrorsService,
    private apiCall: ApiCallService,
    private spinner: NgxSpinnerService,
  ) {
  }

  uploadDocuments(event?: any, allowedDocTypes?: any) {
    return new Observable(obj => {
      let selResult = event != '' && event != undefined ? event.target.value.split('.') : '';
      const docExt = selResult.pop();
      let file = '';
      let fileName = '';
      const docExtLowerCase = docExt.toLowerCase();
      if (allowedDocTypes.match(docExtLowerCase)) {
        if (event.target != undefined && event.target.files) {
          if (event != '') {
            file = event.target.files[0];
            fileName = 'files';
          }
          const reader: any = new FileReader();
          reader.onload = () => {
            const formData = new FormData();
            formData.append(fileName, file);
            this.apiCall.setHttp('post', 'upload/upload-document', true, formData, false, 'fleetExpressBaseUrl');
            // this.subscription =
            this.apiCall.getHttp().subscribe({
              next: (res: any) => {
                this.spinner.hide();
                if (res.statusCode === "200") {
                  obj.next(res);
                }
                else {
                  this.commonMethods.checkDataType(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.commonMethods.snackBar(res.statusMessage, 1);
                }
              },
            })
          }
          reader.readAsDataURL(file);
        }
      }

      else {
        obj.error("Only " + allowedDocTypes + " file format allowed.");
        this.commonMethods.snackBar('Please Select Valid Document', 1);
      }
    })
  }
  uploadProfilePhoto(event?: any, folderName?: any, allowedDocTypes?: any, flag?: any) {
    flag
    return new Observable(obj => {
      let selResult = event != '' && event != undefined ? event.target.value.split('.') : '';
      const docExt = selResult.pop();
      let file = '';
      let fileName = '';
      const docExtLowerCase = docExt.toLowerCase();
      if (allowedDocTypes.match(docExtLowerCase)) {
        // if (10485760 > event.target.files[0].size) {
          if (event.target != undefined && event.target.files) {
            if (event != '') {
              file = event.target.files[0];
              fileName = 'files'
            }
            const reader: any = new FileReader();
            reader.onload = () => {
              const formData = new FormData();
              formData.append('DirName', folderName)
              formData.append(fileName, file);
              this.apiCall.setHttp('post', 'upload/upload-photo', true, formData, false, 'fleetExpressBaseUrl');
              // this.subscription =
              this.apiCall.getHttp().subscribe({
                next: (res: any) => {
                  this.spinner.hide();
                  if (res.statusCode === "200") {
                    obj.next(res);
                  }
                  else {
                    this.commonMethods.checkDataType(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.commonMethods.snackBar(res.statusMessage, 1);
                  }
                },
              })
            }
            reader.readAsDataURL(file);
          }
       /*  } else {
          this.commonMethods.snackBar("Uploading photo upto 10.48 MB", 1)
        } */
      }

      else {
        obj.error("Only " + allowedDocTypes + " file format allowed.");
        this.commonMethods.snackBar('Please Select Valid Document', 1);
      }
    })
  }
  logOut() {
    sessionStorage.clear();
    this.commonMethods.routerLinkRedirect('login');
  }

  getAddressBylatLong(pageNo: any, data: any, pageSize: any): Observable<any> { //pagination 
    this.spinner.show();
    let counter;
    let lastIndex: any;
    if (pageNo == 1) {
      counter = 0
      lastIndex = Number(counter) + pageSize;
    }
    else {
      counter = Number(pageNo + "0") - pageSize;
      lastIndex = pageNo + "0";
    }
    let getData: any = [];
    let sliceArray = data.slice(Number(counter), Number(lastIndex));
    sliceArray.map(async (x: any, i: any) => { //get address by lat & log
      const addressByLatLong = await this.getAddress(x, i);
      getData.push(addressByLatLong);
    });
    setTimeout(() => { this.spinner.hide(); }, 2000, true);
    return getData;
  }

  getAddress(cr: any, i: any) { // get address by lat long
    return new Promise((resolve) => {  //  return new Promise((resolve, reject) => {
      setTimeout(() => {
        let geocoder: any = new google.maps.Geocoder;
        var latlng = { lat: parseFloat(cr.latitude), lng: parseFloat(cr.longitude) };
        geocoder === undefined && (geocoder = new google.maps.Geocoder())
        geocoder.geocode({ 'location': latlng }, (results: any, status: any) => {
          let tempObj: any = new Object();
          tempObj = { ...cr }
          Object.keys(cr).map(function (p) { tempObj[p] = cr[p]; });
          if (status === 'OK') {
            if (results[0]) {
              var address = results.length === 0 ? "Unknown location" : results[0].formatted_address;
              tempObj.address = address;
              resolve(tempObj);
            } else {
              tempObj.address = "Unknown location";
              resolve(tempObj);
            }
          } else {
            tempObj.address = "Unknown location";
            resolve(tempObj);
          }
        })
      }, 200 * i)
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}


