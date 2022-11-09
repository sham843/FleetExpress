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
  /* onlyAlphabets(event: any) {
    if (!this.noSpacesAtStart(event)) {
      return false
    }
    const maskSeperator = new RegExp('^([a-zA-Z])', 'g');
    return maskSeperator.test(event.key);
  } */
  onlyAlphabets(event: any) {
    this.noSpaces(event);
    const maskSeperator = new RegExp('^([a-zA-Z])', 'g');
    return maskSeperator.test(event.key);
}
onlyAlphabetsWithSpace(event: any) {
  const maskSeperator = new RegExp('^([a-zA-Z])', 'g');
  return maskSeperator.test(event.key);
}
  alphabetsWithQuama(event: any) {
    const maskSeperator = new RegExp('^([a-zA-Z ,])', 'g');
    return maskSeperator.test(event.key);
  }
  alphabetsWithSpaces(event: any) {
    const maskSeperator = new RegExp('^([a-zA-Z ])', 'g');
    return maskSeperator.test(event.key);
  }

  alphaNumeric(event: any) {
    const maskSeperator = new RegExp('^([a-zA-Z0-9])', 'g');
    return maskSeperator.test(event.key);
  }

  alphaNumericWithSpaces(event: any) {
    const maskSeperator = new RegExp('^([a-zA-Z0-9 ])', 'g');
    return maskSeperator.test(event.key);
  }

  alphaNumericWithSpacesAndSpecChars(event: any) {
    const maskSeperator = new RegExp('^([a-zA-Z0-9 /(,)&.+-@#$])', 'g');
    return maskSeperator.test(event.key);
  }
  alphaNumericWithSpecificSpecChars(event: any) {
    if (!this.noSpacesAtStart(event)) {
      return false
    }
    const maskSeperator = new RegExp('^([a-zA-Z0-9 /-])', 'g');
    return maskSeperator.test(event.key);
  }
  alphaNumericWithSomeSpecCharOnly(event: any) {
    if (!this.noSpaces(event)) {
      return false
    }
    const maskSeperator = new RegExp('^([a-zA-Z0-9 /,-])', 'g');
    return maskSeperator.test(event.key);
  }
  onlyDigitWithdash(event: any) {
    if (!this.noSpacesAtStart(event)) {
      return false
    }
    const maskSeperator = new RegExp('^([0-9 -])', 'g');
    return maskSeperator.test(event.key);
  }
  onlyDigitWithSlash(event: any) {
    if (!this.noSpaces(event)) {
      return false
    }
    const maskSeperator = new RegExp('^([0-9 /])', 'g');
    return maskSeperator.test(event.key);
  }
  alphaNumWithSpecificSpecChars(event: any) {
    if (!this.noSpacesAtStart(event)) {
      return false
    }
    const maskSeperator = new RegExp('^([a-zA-Z0-9 )(-])', 'g');
    return maskSeperator.test(event.key);
  }
  NumericWithSpecificSpecChars(event: any) {
    const maskSeperator = new RegExp('^([0-9 -.])', 'g');
    return maskSeperator.test(event.key);
  }
  NumericWithdot(event: any) {
    if (!this.noSpacesAtStart(event)) {
      return false
    }
    const maskSeperator = new RegExp('^([0-9.])', 'g');
    return maskSeperator.test(event.key);
  }

  NumericWithSpecificSpecCharsArea(event: any) {
    const maskSeperator = new RegExp('^([0-9-])', 'g');
    return maskSeperator.test(event.key);
  }

  onlyDigits(event: any) {
    const maskSeperator = new RegExp('^([0-9])', 'g');
    return maskSeperator.test(event.key);
  }

  onlyDigitsExcludeZeroAtStart(event: any) {
    const maskSeperator = new RegExp('^[1-9][0-9]*$', 'g');
    return maskSeperator.test(event.key);
  }
  noSpacesAtStart(event: any) {
    const maskSeperator = new RegExp('^(?![\s-])[\w\s-]*$', 'm');
    return !maskSeperator.test(event.key);
  }
  passwordValid(controls: any) {
    const regExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*)(?=.*\W.*)[a-zA-Z0-9\S]{6,}$/);
    if (regExp.test(controls.value)) {
      return null;
    } else {
      return { passwordValid: true }
    }
  }
  setDate(date:Date){
    let d=date;
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    return new Date(d)
  }
  isOver18() { // find Date toDay date to 18 year old Date
    let year = new Date().getFullYear() - 18;
    let month = new Date().getMonth() + 1;
    let date = new Date().getDate();
    let fullDate = month + '-' + date + '-' + year;
    let asd = this.setDate(new Date(fullDate));
    return asd;
}
}
