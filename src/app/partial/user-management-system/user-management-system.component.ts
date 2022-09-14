import { Component, OnInit } from '@angular/core';
import {UntypedFormControl} from '@angular/forms';

@Component({
  selector: 'app-user-management-system',
  templateUrl: './user-management-system.component.html',
  styleUrls: ['./user-management-system.component.scss']
})
export class UserManagementSystemComponent implements OnInit {
  toppings = new UntypedFormControl('');
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  constructor() { }

  ngOnInit(): void {
  }

}
