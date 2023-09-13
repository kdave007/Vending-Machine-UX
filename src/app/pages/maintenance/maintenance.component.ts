import {Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, TemplateRef} from '@angular/core';
import { Router } from '@angular/router';
import { GlobalTomDataService } from '../../services/global-tom-data.service';
import { Subscription } from 'rxjs';
import { Options } from 'ng5-slider';
import { PLC_IO, TomData, SalesLog, TotalSales, PWM_CHANNELS, TOPPING_PWM_LV } from '../../core/templates/main';
import { FlavourList } from '../../core/templates/flavour';
import { Toasted_List } from '../../core/templates/toasted';
import { NbDialogService } from '@nebular/theme';


@Component({
  selector: 'app-maintenance',
  styleUrls: ['./maintenance.component.scss'],
  templateUrl: './maintenance.component.html',
})

export class MaintenanceComponent implements OnInit,OnDestroy {
  tomObject: TomData;  
  subscription: Subscription;

  motorSpeed: any = {
    value: 1, current: 1
  }

  value: number = 100;

  pwmOptions: Options = {
    floor: 1,
    ceil: 1000
  };

  speedOPtions: Options = {
    floor: 1,
    ceil: 500
  }

  toppingOptions: Options = {
    floor: 0,
    ceil: 25
  };

  TOPPINGS: any[] = [
    { id: FlavourList.Flavour_0, value: 0, current: 0 },
    { id: FlavourList.Flavour_1, value: 0, current: 0 },
    { id: FlavourList.Flavour_2, value: 0, current: 0 },
    { id: FlavourList.Flavour_3, value: 0, current: 0 },
  ]

  PWMS: any[] = [
    { id: 1, value: 1, current: 1 },
    { id: 2, value: 1, current: 1 },
    { id: 3, value: 1, current: 1 },
    { id: 4, value: 1, current: 1 },
  ]
  
  GPIOS_IN: any[] = [
    { id: PLC_IO.PLC_PIN_0, name: "0 (Muffin IN)", status: false },
    { id: PLC_IO.PLC_PIN_1, name: "1 (Measure sens)", status: false },
    { id: PLC_IO.PLC_PIN_2, name: "2 (Muffin OUT)", status: false },
    { id: PLC_IO.PLC_PIN_3, name: 2, status: false },
    { id: PLC_IO.PLC_PIN_4, name: 4, status: false },
    { id: PLC_IO.PLC_PIN_5, name: 5, status: false },
    { id: PLC_IO.PLC_PIN_6, name: 6, status: false },
    { id: PLC_IO.PLC_PIN_7, name: 7, status: false },
    { id: PLC_IO.PLC_PIN_10, name: 10, status: false },
    { id: PLC_IO.PLC_PIN_11, name: 11, status: false },
    { id: PLC_IO.PLC_PIN_12, name: 12, status: false },
    { id: PLC_IO.PLC_PIN_13, name: 13, status: false },
    { id: PLC_IO.PLC_PIN_14, name: 14, status: false },
    { id: PLC_IO.PLC_PIN_15, name: 15, status: false },
    { id: PLC_IO.PLC_PIN_16, name: 16, status: false },
    { id: PLC_IO.PLC_PIN_17, name: 17, status: false },
  ];

  GPIOS_OUT: any[] = [
    { id: PLC_IO.PLC_PIN_0, name: "0 (Topping 0 - NA)", status: false },
    { id: PLC_IO.PLC_PIN_1, name: "1 (Topping 1 - NA)", status: false },
    { id: PLC_IO.PLC_PIN_2, name: "2 (Topping 2 - NA)", status: false },
    { id: PLC_IO.PLC_PIN_3, name: "3 (Topping 3 - NA)", status: false },
    { id: PLC_IO.PLC_PIN_4, name: 4, status: false },
    { id: PLC_IO.PLC_PIN_5, name: 5, status: false },
    { id: PLC_IO.PLC_PIN_6, name: 6, status: false },
    { id: PLC_IO.PLC_PIN_7, name: 7, status: false },
    { id: PLC_IO.PLC_PIN_10, name: "10 (SSR sup)", status: false },
    { id: PLC_IO.PLC_PIN_11, name: "11 (SSR inf)", status: false },
    { id: PLC_IO.PLC_PIN_12, name: 12, status: false },
    { id: PLC_IO.PLC_PIN_13, name: 13, status: false },
    { id: PLC_IO.PLC_PIN_14, name: "14 (Motor 1 FWD)", status: false },
    { id: PLC_IO.PLC_PIN_15, name: "15 (Motor 1 REV)", status: false },
    { id: PLC_IO.PLC_PIN_16, name: "16 (Motor 2 FWD)", status: false },
    { id: PLC_IO.PLC_PIN_17, name: "17 (Motor 2 REV)", status: false },
  ];

  ///< Table log headers
  salesHeaders = [
    { name: 'Date time' },
    { name: 'Topping 0' },
    { name: 'Topping 1' },
    { name: 'Topping 2' },
    { name: 'Topping 3' },
    { name: 'No topping' },
    { name: 'Toast' },
  ]

  ///< Table total sales headers
  totalSalesHeaders = [
    { name: 'Topping 0' },
    { name: 'Topping 1' },
    { name: 'Topping 2' },
    { name: 'Topping 3' },
    { name: 'No topping' },
    { name: 'Toast Lv1' },
    { name: 'Toast Lv2' },
    { name: 'Toast Lv3' },
  ]
  
  /*
  salesLog: SalesLog[] = [
    { dateTime: "30-03-1994 12:02 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 12:01 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 12:00 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 11:02 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 10:30 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 10:02 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 9:02 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 8:02 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 7:02 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 6:02 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 5:02 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 4:02 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 3:02 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 2:02 pm", topping1: true, topping2: false, topping3: true, topping4: false },
    { dateTime: "30-03-1994 1:02 pm", topping1: true, topping2: false, topping3: true, topping4: false },
  ]*/

  salesLog: any;
  totalSales: any;

  /*
  totalSales: TotalSales = {
    topping1: 1,
    topping2: 2,
    topping3: 3,
    topping4: 4,
    noTopping: 5,
  }*/


  totalSalesOptions: DataTables.Settings = {};
  flavoursLogOptions: DataTables.Settings = {};

  constructor(private router: Router,private tomService : GlobalTomDataService, private zone:NgZone, private changeDetectorRef: ChangeDetectorRef, private dialogService: NbDialogService) { }

  ngOnInit() {
    this.tomService.cast.subscribe( tomSubject => { 
      this.tomObject=tomSubject;
    });

    this.tomService.getInputs().subscribe(inputs => {
      this.updateInputs(inputs);
    });

    this.tomService.getSales().subscribe(sales => {
      this.updateSales(sales);
    });

    this.tomService.getSalesCount().subscribe(salesCount => {
      this.updateSalesCount(salesCount);
    });

    this.tomService.getSpeed().subscribe(speed => {
      this.updateMotorSpeed(speed);
    });

    this.tomService.getToppingsAmount().subscribe(amounts => {
      this.updateToppingAmount(amounts);
    });

    for (let index = 0 ; index < FlavourList.Flavour_max ; index++) {
      this.TOPPINGS[index].value = this.tomObject.toppingLevels[index];
      this.TOPPINGS[index].current = this.tomObject.toppingLevels[index];
    }

    this.totalSalesOptions = {
      searching: false,
      paging: false,
      info: false,
      ordering: false,
    };

    this.flavoursLogOptions = {
      searching: false,
      lengthChange: false,
      ordering: false,
      columnDefs: [ { orderable: false, targets: [0,1,2,3,4] }],
    };

    this.tomService.getSalesLog();
    this.tomService.getTotalSales();
    this.tomService.getFlavoursAmount();
    this.tomService.getMotorSpeed();
  }  

  /**
   * @brief
   *  Update inputs
   * 
   * @param inputs 
   *  Inputs array
   */
  updateInputs(inputs){
    for (let index = PLC_IO.PLC_PIN_0; index < PLC_IO.PLC_MAX_PINS; index++) {
      this.GPIOS_IN[index].status = inputs[index];               
    }

    this.zone.run(() => {});
  }

  /**
   * @brief
   *  Update sales log from service
   * 
   * @param sales 
   *  Sales log
   */
  updateSales(sales){
    this.salesLog = sales;

    for (let index = 0 ; index < this.salesLog.length ; index++) {      
      this.salesLog[index].T1 = this.salesLog[index].T1 == 1 ? "sold" : "---";
      this.salesLog[index].T2 = this.salesLog[index].T2 == 1 ? "sold" : "---";
      this.salesLog[index].T3 = this.salesLog[index].T3 == 1 ? "sold" : "---";
      this.salesLog[index].T4 = this.salesLog[index].T4 == 1 ? "sold" : "---";
      this.salesLog[index].NT = this.salesLog[index].NT == 1 ? "sold" : "---";

      this.salesLog[index].toast = this.salesLog[index].toast == Toasted_List.Toasted_S ? "low" : 
                                   this.salesLog[index].toast == Toasted_List.Toasted_M ? "medium" : "high"; 

      this.salesLog[index].date_time = String(this.salesLog[index].date_time).replace('(hora estándar central)',''); 
    }

    this.zone.run(() => {});
  }
  
  /**
   * @brief
   *  Update sales count from service
   * 
   * @param salesCount 
   *  Sales count
   */
  updateSalesCount(salesCount){
    this.totalSales = salesCount;

    this.zone.run(() => {});
  }

  /**
   * @brief
   *  Update motor speed from observable
   * 
   * @param speed 
   *  Motor speed
   */
  updateMotorSpeed(speed: number){
    this.motorSpeed.value = speed;
    this.motorSpeed.current = speed;
  }

  /**
   * @brief
   *  Update topping amount from service
   * 
   * @param amounts
   *  Topping amounts
   */
  updateToppingAmount(amounts){
    for (let index = 0 ; index < FlavourList.Flavour_max ; index++) {
      this.TOPPINGS[index].current = amounts[index];
      this.TOPPINGS[index].value = amounts[index];
    }

    this.zone.run(() => {});
  }

  /**
   * @brief
   *  Move forward all motors
   * 
   * @param opt 
   *  true -> move motors
   *  false -> stop motors
   */
  moveBread(opt: boolean){
    this.GPIOS_OUT[PLC_IO.PLC_PIN_14].status = opt;
    this.GPIOS_OUT[PLC_IO.PLC_PIN_16].status = opt;

    this.tomService.setGPIO(PLC_IO.PLC_PIN_14, opt);
    this.tomService.setGPIO(PLC_IO.PLC_PIN_16, opt);

    this.changeDetectorRef.detectChanges();
  }
  
  /**
   * @brief
   *  Exit confirmation dialog
   * 
   * @param dialog 
   *  Dialog
   */
  showExitWarning(dialog: TemplateRef<any>){
    this.dialogService.open(dialog, { context: 'All outputs will be reset!' });
  }

  /**
   * @brief
   *  Show welcome page
   */
  showWelcome(){
    this.tomService.restoreValues();
    this.router.navigate(['/pages/welcome']);
    this.zone.run(() => {});
  }

  ngOnDestroy(): void{
    //this.subscription.unsubscribe();
  }

  /**
   * @brief
   *  Toggle GPIO out status
   * 
   * @param checked
   *  true -> ON
   *  false -> OFF
   * 
   * @param id
   *  GPIO id
   */
  toggleGPIO(checked: boolean, id: any) {
    this.tomService.setGPIO(id, checked);
    this.GPIOS_OUT[id].status = checked;
  }

  /**
   * @brief
   *  Update PWM value
   * 
   * @param id
   *  PWM id 
   *  
   * @param value
   *  PWM duty cycle 
   */
  updatePWM(id: any, value: any) {
    this.tomService.setPWM(id, value);

    this.PWMS[id - 1].current = value;
  }
 
  /**
   * @brief
   *  Save new speed in the database
   * 
   * @param speed 
   *  Motor speed in mm/s
   */
  setNewSpeed(speed: number){
    this.tomService.updateSpeed(speed);

    this.updateMotorSpeed(speed);
  }

  /**
   * @brief
   *  Update topping level
   * 
   * @param id 
   *  Topping ID
   * 
   * @param value
   *  New topping level
   */
  updateToppingLv(id: any, value: any) {
    this.tomObject.toppingLevels[id] = value;
    this.tomService.updateTom(this.tomObject);
    this.TOPPINGS[id].current = value;

    this.tomService.updateToppingAmount(id, value);
  }
}
