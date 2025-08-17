import {Component, ElementRef, Injectable, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatCard, MatCardContent} from "@angular/material/card";
import {DataServerService} from "./data-server.service";
import {NgClass, NgStyle} from "@angular/common";
import {Subscription} from "rxjs";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {MatButton} from "@angular/material/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {MatIcon} from "@angular/material/icon";

interface TableConfig {
  title: string;
  columns: string[];
  headers: string[];
  dataSource: MatTableDataSource<any>;
}

/**
 * The `DetailViewComponent` is a standalone Angular component responsible for displaying detailed information
 * in a card-based layout with optional styles, data tables, and print functionality. It utilizes Material Design components
 * for styling and rendering interactive elements.
 */
@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-detail-view',
  imports: [
    MatCard,
    MatCardContent,
    NgClass,
    NgStyle,
    MatCell,
    MatCellDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatButton,
    MatIcon,
  ],
  templateUrl: './detail-view.component.html',
  standalone: true,
  styleUrl: './detail-view.component.css'
})
export class DetailViewComponent implements OnInit, OnDestroy {

  data!: MatTableDataSource<any>;
  tableConfigs: TableConfig[] = [];

  @Input() defaultImage : string = '';
  @Input() showDisplayMessage!: boolean;
  @Input() showDisplayColors!: boolean;
  @Input() messageToDisplay!: string;
  @Input() setStatusColors: { value: string; color: { background: string; text: string } }[] = [];
  @Input() isEnablePrint: boolean = false;

  @ViewChild('detailContainer', {static: true}) detailContainer!: ElementRef;


  isNoSelectedValue: boolean = true;
  isSelectedValue: boolean = false;
  info: { label: string, value: any }[] = [];
  photo: string = '';
  FullName: string = '';
  cardTitle: string = '';
  defaultImageUrl = 'default.png';
  private decodeValue!: any;
  private dataSubscription!: Subscription;

  constructor(private dataService: DataServerService) {
  }

  ngOnInit() {
    this.dataSubscription = this.dataService.currentData.subscribe(data => {
      this.processData(data);
    });
  }

  /**
   * Processes the provided data to extract information and update relevant properties.
   *
   * @template T
   * @param {T | null} data - The input data to be processed. Can be null or an array of objects containing `Label` and `Value` pairs.
   * @return {void} This method does not return any value, but it initializes or updates instance properties based on the input data.
   */
  private processData<T>(data: T | null) {
    if (!Array.isArray(data) || data.length === 0) {

      this.info = [];
      this.photo = '';
      this.FullName = '';
      this.cardTitle = '';
      this.isNoSelectedValue = true;
      this.isSelectedValue = false;
      this.tableConfigs = [];
      return;
    }

    this.isNoSelectedValue = false;
    this.isSelectedValue = true;

    this.info = data
      .filter(info => info.Label.toLowerCase() !== 'photo')
      .filter(info => info.Label.toLowerCase() !== 'title')
      .filter(info => info.Label.toLowerCase() !== 'table')
      .map(info => ({label: info.Label, value: info.Value}));

    const source = data.find(info => info.Label.toLowerCase() === 'photo' || info.Label.toLowerCase() === 'source');
    const fullName = data.find(info => info.Label.toLowerCase() === 'full name' || info.Label.toLowerCase() === 'user name');
    const title = data.find(info => info.Label.toLowerCase() === 'title');
    const tableInfo = data.find(info => info.Label.toLowerCase() === 'table');

    if (tableInfo?.Value) {
      this.tableConfigs = [];
      tableInfo.Value.forEach((tableData: any) => {
        this.tableConfigs.push({
          title: tableData.title,
          columns: tableData.columns,
          headers: tableData.headers,
          dataSource: new MatTableDataSource(tableData.data)
        });
      });
    }

    if (source?.Value === null) {
      this.photo = this.defaultImage !== '' ? this.defaultImage : this.defaultImageUrl;
    } else {
      this.photo = this.decodeBase64Data(source?.Value);
    }

    this.FullName = fullName ? fullName.Value : '';
    this.cardTitle = title ? title.Value : '';
  }

  /**
   * Decodes a given Base64 encoded string into a plain string.
   * If the input value is null, undefined, or empty, a default image value is set.
   * Logs an error and sets to default if decoding fails.
   *
   * @param {any} value - The Base64 encoded string to decode.
   * @return {string} - The decoded string after conversion, or the default value in case of errors or invalid input.
   */
  private decodeBase64Data(value: any): string {
    if (value === null || value === undefined || value === '') {
      this.photo = this.defaultImage !== '' ? this.defaultImage : this.defaultImageUrl; // Set to default image if no value provided
    } else {
      try {
        // Decode the Base64 value
        this.decodeValue = atob(value);

        // Convert the decoded string into a Uint8Array (binary data)
        const byteCharacters = new Uint8Array(this.decodeValue.length);
        for (let i = 0; i < this.decodeValue.length; i++) {
          byteCharacters[i] = this.decodeValue.charCodeAt(i);
        }

      } catch (error) {
        console.error('Error decoding Base64 value or handling file:', error);
        this.photo = this.defaultImage;
      }
    }
    return this.decodeValue;
  }

  /**
   * Adds a style class based on the provided value and the status of display colors.
   *
   * @param {string} value - The value used to determine the corresponding style class.
   * @return {string} Returns 'status-cell' if the value matches a condition and display colors are enabled, otherwise returns an empty string.
   */
  addStyleClass(value: string): any {
    const filter = this.setStatusColors.find(f => f.value === value);
    return filter && this.showDisplayColors ? 'status-cell' : '';
  }

  /**
   * Retrieves the style object based on the provided value.
   *
   * @param {string} value - The value used to match and retrieve the corresponding style.
   * @return {Object} A style object containing 'background-color' and 'color' properties, or an empty object if no match is found.
   */
  getStyle(value: string): any {
    const filter = this.setStatusColors.find(f => f.value === value);
    return filter ? {'background-color': filter.color.background, 'color': filter.color.text} : {};
  }

  /**
   * Retrieves a nested value from an object based on a dot-separated path.
   * If the value is in an array at any level of nesting, collects and joins those values into a single string separated by commas.
   * If the object or path leads to a non-existent value, a default placeholder '-' is returned.
   *
   * @param {object} object - The object to retrieve the nested value from. Can be null or undefined.
   * @param {string} path - The dot-separated string representing the path to the desired value.
   * @return {*} The retrieved value from the specified path. Returns '-' if the value is not found.
   */
  getNestedValue(object: any, path: string): any {
    // object is null or undefined
    if (!object) return '-';

    // Check if path has array notation
    // ex:- accommodationfacilities.roomfacilities.name -> ['accommodationfacilities', 'roomfacilities', 'name']
    const keys = path.split('.');
    let value = object;

    // loop to access data
    for (const key of keys) {
      if (Array.isArray(value)) {
        // current value is an array, map over its items
        value = value.map(item => item[key]).filter(item => item !== undefined);
      } else {
        value = value?.[key]; // Access the next level
      }
    }

    // value is an array, join the values for display
    return Array.isArray(value) ? value.join(', ') : value || '-';
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  /**
   * Generates a PDF document of the container element and downloads it as a file.
   * It captures the content of the container element using `html2canvas`,
   * processes it into one or more pages with appropriate scaling and pagination,
   * and uses `jsPDF` to create and save the PDF. The method also temporarily hides
   * the print button inside the container during the capture to exclude it from the output.
   *
   * @return {void} This method does not return any value.
   */
  print() {
    const containerElement = this.detailContainer.nativeElement;
    const printButton = containerElement.querySelector('.print-btn-container');

    if (printButton) {
      printButton.style.display = 'none'; // Hide print button before capture
    }

    setTimeout(() => {
      html2canvas(containerElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true
      }).then((canvas) => {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        let imgWidth = pageWidth - margin * 2;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (imgHeight <= pageHeight - margin * 2) {
          // Small content: Scale to fit on a single page
          pdf.addImage(
            canvas.toDataURL('image/png'),
            'PNG',
            margin,
            margin,
            imgWidth,
            imgHeight
          );
        } else {
          // Large content: Paginate
          let position = 0;
          let heightLeft = imgHeight;
          let pagePosition = margin;

          while (heightLeft > 0) {
            const printHeight = Math.min(heightLeft, pageHeight - pagePosition - margin);
            //@ts-ignore
            const pageCanvas = document.createElement('canvas');
            const pageContext = pageCanvas.getContext('2d');

            pageCanvas.width = canvas.width;
            pageCanvas.height = (printHeight * canvas.width) / imgWidth;

            if (pageContext) {
              pageContext.drawImage(
                canvas,
                0, position,
                canvas.width, pageCanvas.height,
                0, 0,
                pageCanvas.width, pageCanvas.height
              );

              pdf.addImage(
                pageCanvas.toDataURL('image/png'),
                'PNG',
                margin, pagePosition,
                imgWidth,
                printHeight
              );
            }

            heightLeft -= printHeight;
            position += pageCanvas.height;

            if (heightLeft > 0) {
              pdf.addPage();
              pagePosition = margin;
            }
          }
        }

        pdf.save(`${this.cardTitle || 'details'}.pdf`);

        if (printButton) {
          printButton.style.display = 'block';
        }
      }).catch((error) => {
        console.error('Error generating PDF:', error);
        if (printButton) {
          printButton.style.display = 'block';
        }
      });
    }, 100);
  }

}
