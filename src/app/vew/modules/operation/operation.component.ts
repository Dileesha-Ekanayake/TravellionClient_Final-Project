import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {AvDataTable} from "@avoraui/av-data-table";

@Component({
    selector: 'app-operation',
    templateUrl: './operation.component.html',
  imports: [
    ReactiveFormsModule,
    AvDataTable

  ],
    styleUrl: './operation.component.css',
  standalone: true,
})
export class OperationComponent implements OnInit{

  innertable!: FormGroup;

  headers: { label: string; align: 'left' | 'center' | 'right' }[] = [
    { label: 'Name', align: 'left' },
    { label: 'NIC', align: 'left' },
    { label: 'Gender', align: 'left' },
    { label: 'Action', align: 'center' }
  ];

  columns : { field: string; align: 'left' | 'center' | 'right' }[] = [
    { field: 'name', align: 'left' },
    { field: 'nic', align: 'left' },
    { field: 'gender', align: 'left' },
  ]

  employees = [
    { name: 'John Doe', nic: '123456789V', gender: 'Male' },
    { name: 'Jane Smith', nic: '987654321V', gender: 'Female' },
    { name: 'Alex Johnson', nic: '456123789V', gender: 'Male' }
  ];


  constructor(
    private formBuilder : FormBuilder,
  ) {

    this.innertable = this.formBuilder.group({
      innertable: new FormControl(),
    })
  }


  ngOnInit() {
    this.innertable.controls['innertable'].patchValue(this.employees);
  }
}
