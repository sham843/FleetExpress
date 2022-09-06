import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }
  noSpaces(event: any) {
    const maskSeperator = new RegExp('^[ ]+|[ ]+$', 'gm');
    return !maskSeperator.test(event.key);
}
}
