import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-user-management-system',
  templateUrl: './user-management-system.component.html',
  styleUrls: ['./user-management-system.component.scss']
})
export class UserManagementSystemComponent implements OnInit {
  toppings = new FormControl('');
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  constructor() { }

  ngOnInit(): void {
  }

}
