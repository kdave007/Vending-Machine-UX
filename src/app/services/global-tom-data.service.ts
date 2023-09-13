import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { TomData, PLC_IO, BITS_IN_BYTE, PLC_COMMANDS, PLC_RESULT, PWM_CHANNELS, MuffinSlice, TomFlavour, toppingSale, SALES_TYPES, TOPPING_PWM_LV } from '../core/templates/main';
import { FlavourAmountModes, FlavourList } from '../core/templates/flavour';
import { Toasted_List, ToastedInfo } from '../core/templates/toasted';
import { Language } from '../core/templates/language';

import * as SerialPort from 'serialport';
import * as Net from 'net';
import * as $ from 'jquery';


///< Datos de conexion TCP IP
const PLC_URL = '30.3.94.2';
const PLC_PORT = 8092;
const PC_PORT = 8081;

class TcpCommand{
  command: any;
  ex1: any;
  ex2: any;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalTomDataService{
  // Variables de comprobacion ELECTRON
  private userAgent  = navigator.userAgent.toLowerCase();
  private isElectron = this.userAgent.indexOf(' electron/') > -1 ? true : false;  

  // Variables de clase TOM
  public tom: TomData = new TomData();
  public tomSubject: any;
  public salesLog: any;
  public motorSpeed: any;
  cast: any;

  // Variables de comunicacion serial
  private serialPort: typeof SerialPort;
  private port: any;
  private parser: any;

  // Variables de comunicacion TCP (cliente)  
  private net: typeof Net;
  private portNet: any = null;
  private tcpTx: any;

  private remote: any;
  private mysql: any; 
  private connection: any;

  // Pending buffer variables
  private tcpPendBuff: TcpCommand[] = []; ///< Buffer for pending requests
  private tcpPendBuffSize: number = 0; ///< Current pending size
  private tcpPendBuffMax: number = 50; ///< Maximum number of pending requests
  private tcpPendBuffPosW: number = 0; ///< Current writting buffer position
  private tcpPendBuffPosR: number = 0; ///< Current reading buffer position

  private bufferSize: number = 8;  ///< Modify TCP TX buffer size to your needs

  // Variables de comunicacion TCP (servidor)
  private netServer: typeof Net;
  private serverNet: any;  

  private inputsSubject = new Subject<any>();
  private salesLogSubject = new Subject<any>();
  private motorSpeedSubject = new Subject<any>();
  private totalSalesLogSubject = new Subject<any>();
  private toppingsAmountSubject = new Subject<any>();

  ///< Connection status, true when connected
  public conStatus: any = {
    tcpServer: false,
    tcpClient: false,
    serial: false,

    plcAck: PLC_RESULT.PLC_NA,

    tcpClientPend: false, ///< true when a tcp answer is being waiting
  }

  constructor() { 
    let self = this;

    this.initTom();

    this.tomSubject = new BehaviorSubject<TomData>(this.tom);
    this.cast = this.tomSubject.asObservable();  

    if (this.isElectron) {
      this.remote = (<any>window).require('electron').remote;
      this.net = (<any>window).require('net');
      this.netServer = (<any>window).require('net');
      this.tcpTx = Buffer.alloc(this.bufferSize);
      this.mysql = this.remote.require('mysql');

      this.connection = this.mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'atechnik',
        database: 'tom'
      });
      
     this.connection.connect((err) => {
        if (err) {
            console.log('error connecting', err);
        }else{
            console.log("connection was a success ");
        }
      });
      
    }

    self.initTcpServer();
    self.initTcpCLient();   
  }        
        

  ///< Get flavours Amount
  public getFlavoursAmount(){
    let query = "SELECT * FROM toppings";

    let self = this;

    this.connection.query(query, function(err, rows, fields) {
      if(err){
          console.log("An error ocurred performing the query.");
          console.log(err);
          return;
      }

      self.tom.toppingLevels[FlavourList.Flavour_0] = rows[0].T1;
      self.tom.toppingLevels[FlavourList.Flavour_1] = rows[0].T2;
      self.tom.toppingLevels[FlavourList.Flavour_2] = rows[0].T3;
      self.tom.toppingLevels[FlavourList.Flavour_3] = rows[0].T4; 
    
      self.toppingsAmountSubject.next(self.tom.toppingLevels);
    });
  }

  public getMotorSpeed(){
    let query = "SELECT * FROM motor";
    let self = this;

    this.connection.query(query, function(err, rows, fields) {
      if(err){
          console.log("An error ocurred performing the query.");
          console.log(err);
          return;
      }

      self.motorSpeed = rows[0].speed;
      self.motorSpeedSubject.next(self.motorSpeed);
    });
  }

  public getSalesLog(){
    let query = "SELECT * FROM sales ORDER BY date_time DESC";

    let self = this;

    this.connection.query(query, function(err, rows, fields) {
      if(err){
          console.log("An error ocurred performing the query.");
          console.log(err);
          return;
      }

      self.salesLog = rows;

      self.salesLogSubject.next(self.salesLog);
    });
  }

  public getTotalSales(){
    let self = this;
    let query: string;
 
    for (let index = 0 ; index < SALES_TYPES.SALE_MAX_SALES ; index++) {      
    
      switch(index){
        case SALES_TYPES.SALE_FLAVOUR_0:
          query = "SELECT COUNT(T1) as items FROM sales WHERE T1 = true";
          break;

        case SALES_TYPES.SALE_FLAVOUR_1:
          query = "SELECT COUNT(T2) as items FROM sales WHERE T2 = true";
          break;

        case SALES_TYPES.SALE_FLAVOUR_2:
          query = "SELECT COUNT(T3) as items FROM sales WHERE T3 = true";
          break;

        case SALES_TYPES.SALE_FLAVOUR_3:
          query = "SELECT COUNT(T4) as items FROM sales WHERE T4 = true";
          break;

        case SALES_TYPES.SALE_NO_FLAVOUR:
          query = "SELECT COUNT(NT) as items FROM sales WHERE NT = true";
          break;

        case SALES_TYPES.SALE_TOAST_LV1:
          query = "SELECT COUNT(toast) as items FROM sales WHERE toast = " + String(Toasted_List.Toasted_S);
          break;

        case SALES_TYPES.SALE_TOAST_LV2:
          query = "SELECT COUNT(toast) as items FROM sales WHERE toast = " + String(Toasted_List.Toasted_M);
          break;

        case SALES_TYPES.SALE_TOAST_LV3:
          query = "SELECT COUNT(toast) as items FROM sales WHERE toast = " + String(Toasted_List.Toasted_H);
          break;
      }

      this.connection.query(query, function(err, rows, fields) {
        if(err){
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        self.tom.toppingSales[index] = rows[0].items;
        self.totalSalesLogSubject.next(self.tom.toppingSales);
      });
      
    }

  }

  public updateSpeed(speed: number){
    let query = "UPDATE motor SET speed = " + String(speed);

    this.connection.query(query, function(err, rows, fields) {
      if(err){
          console.log("An error ocurred performing the query.");
          console.log(err);
          return;
      }
  
      //console.log("Query succesfully executed", rows);
    });
  }

  public insertSale(sales: toppingSale){
    let query = "INSERT INTO sales (T1,T2,T3,T4,NT,toast) VALUES (" +
    String(sales.topping1) + "," + String(sales.topping2) + "," + String(sales.topping3) + "," + String(sales.topping4) + "," +
    String(sales.noTopping) + "," + String(sales.toast) + ")";

    //console.log(query);

    this.connection.query(query, function(err, rows, fields) {
      if(err){
          console.log("An error ocurred performing the query.");
          console.log(err);
          return;
      }
  
      //console.log("Query succesfully executed", rows);
    });
  }
  
  public updateToppingAmount(flavour: FlavourList, amount: number){
    let flavourId: string;

    switch(flavour){
      case FlavourList.Flavour_0:
        flavourId = "T1";
        break;

      case FlavourList.Flavour_1:
        flavourId = "T2";
        break;

      case FlavourList.Flavour_2:
        flavourId = "T3";
        break;

      case FlavourList.Flavour_3:
        flavourId = "T4";
        break;
    }

    let query = "UPDATE toppings SET " + flavourId + " = " + String(amount);

    this.connection.query(query, function(err, rows, fields) {
      if(err){
          console.log("An error ocurred performing the query.");
          console.log(err);
          return;
      }
  
      //console.log("Query succesfully executed", rows);
    });

    // TODO check and validate query
  }

  /**
   * @brief
   *  Actualiza los contenidos de la clase TOM
   * @param updatedTom 
   * Clase TOM
   */
  public updateTom(updatedTom: any){
    this.tomSubject.next(updatedTom);
  }

  /**
   * @brief
   *  Inicializa los valores de la clase TOM
   */
  private initTom(){  
    for (let index = PLC_IO.PLC_PIN_0 ; index < PLC_IO.PLC_MAX_PINS ; index++) {
      this.tom.inputs[index] = false; 
      this.tom.outputs[index] = false;     
    }   
    
    for (let index = 0; index < this.tcpPendBuffMax; index++) {
      this.tcpPendBuff[index] = new TcpCommand;
    }
  }

  /**
   * @brief
   *  Inicializa el puerto serial
   */
  private initSerialPort(){
    if (this.isElectron) {
      let self = this;
      this.serialPort = (<any>window).require('serialport');

      if(this.port == null){
        this.port = new this.serialPort('/dev/ttyUSB0', {
          baudRate:57600,
          autoOpen: false
        });
      }

      this.port.open(function (err) {
        if (err) {
          self.conStatus.serial = false;

          console.log('[Serial-Error] Error opening port: ', err.message);

          $(function() {
            setTimeout(function() {
              self.initSerialPort();
            },1000);
          })
        }
        else{
          self.conStatus.serial = true;
        }
      })

      this.parser = new this.serialPort.parsers.Readline({ delimiter: '\n' });

      this.port.pipe(this.parser);

      this.parser.on('data', function (data:any) {
        console.log('Data2:', data) // TODO process received data
      })
    } 
  }

  /**
   * @brief
   *  Inicializa el cliente TCP IP
   */
  private initTcpCLient(){    
    if (this.isElectron) {
      this.portNet = new this.net.Socket();

      let self = this;

      this.portNet.connect(PLC_PORT, PLC_URL, function() {        
      });

      this.portNet.on('data', function(data) {        
        self.conStatus.plcAck = ( data[0] == 0 && data[1] == 0 ) ? PLC_RESULT.PLC_OK: PLC_RESULT.PLC_ERROR;        

        //console.log(self.conStatus.plcAck == PLC_RESULT.PLC_OK ? "PLC OK" : "PLC_ERROR");      

        if(self.tcpPendBuffSize > 0){
          let pos = self.tcpPendBuffPosR;

          self.tcpPendBuffSize --;    
          self.tcpPendBuffPosR ++;      

          if(self.tcpPendBuffPosR == self.tcpPendBuffMax){
            self.tcpPendBuffPosR = 0;
          }

          self.writeCommand(self.tcpPendBuff[pos].command, self.tcpPendBuff[pos].ex1, self.tcpPendBuff[pos].ex2);       
        }
        else{
          self.conStatus.tcpClientPend = false;
        }
      });

      this.portNet.on('error', function(err) {
        self.conStatus.tcpClient = false;

        self.portNet.destroy();

        $(function() {
          setTimeout(function() {
            self.initTcpCLient();
          },1000);
        })

        console.log("[TCP-ERROR] Init client error:")
        console.log(err);
      });

      this.portNet.on('ready', function() {
        self.conStatus.tcpClient = true;
        self.initPlcClient();        
      });
    }
  }

  /**
   * @brief
   *  Inicializa el servidor TCP IP
   */
  private initTcpServer(){  
    if (this.isElectron) {
      let self = this;

      this.serverNet = this.netServer.createServer((socket) => {
      }).on('error', (err) => {

        self.serverNet.end();
        self.serverNet.destroy();
        
        self.conStatus.tcpServer = false;

        $(function() {
          setTimeout(function() {
            self.initTcpServer();
          },1000);
        })

        console.log("[TCP-ERROR] Init server error:")
        console.log(err);
      });

      this.serverNet.listen(PC_PORT);      

      this.serverNet.on('connection', function(sock) {
        self.conStatus.tcpServer = true;

        sock.on('data', function(data) {
            self.updateInputs(data);
        });
      });
    }
  }

  /**
   * @brief
   *  Funcion de prueba para el envio de mensajes en TCP IP
   * @param message 
   *  Mensaje a enviar
   */
  public sendSocketMsg(message: string){
    if (this.isElectron && this.conStatus.tcpClient) {
      this.portNet.write(message);      
    }
    // Case: Socket not connected
    else if(this.isElectron && !this.conStatus.tcpClient){
      let self = this;

      $(function() {
        setTimeout(function() {
          self.sendSocketMsg(message);
        },1000);
      })
    }
  }

  /**
   * @brief
   *  Funcion de prueba para el envio de mensajes en serial
   * @param message 
   *  Mensaje a enviar
   */
  public sendSerialMessage(message:string){
    if (this.isElectron && this.conStatus.serial) {            
      this.port.write(message, function(err:any){
        if(err){
          return console.log('Error on write: ', err.message); // TODO process error
        }
        console.log('Message written!'); // TODO for debugging purpose
      })
    }
  }

  /**
   * @brief
   *  Actualiza los estados de las entradas
   * @param rawInputs 
   *  Estado de las entradas recibidas por el PLC
   */
  private updateInputs(rawInputs: any){   
    const byteToCheck = 2; ///< Number of bytes to check, modify when required
    
    // Previene errores de segmento
    if(rawInputs.length < byteToCheck){
      return;
    }    

    let inputStatus = false; ///< Current input status
    let inputNumber = PLC_IO.PLC_PIN_0; ///< Current pin number

    // Check bytes
    for(let byteIndex = 0 ; byteIndex < byteToCheck ; byteIndex ++){
      // Check bits
      for(let bitIndex = BITS_IN_BYTE.BIT_0 ; bitIndex <= BITS_IN_BYTE.BIT_7 ; bitIndex ++){
        // Check current input status
        inputStatus = ( ( ( rawInputs[ byteIndex ] ) >> ( bitIndex ) ) & 1) == 1 ? true : false;

        // Notifies new input value when required
        if(inputStatus != this.tom.inputs[inputNumber]){
          this.tom.updatedInputs = true;
          this.tom.inputs[inputNumber] = inputStatus;
        }

        //console.log(this.tom.inputs[inputNumber]);

        inputNumber ++;
      }
    }

    this.inputsSubject.next(this.tom.inputs);
  }  

  /**
   * @brief
   *  Inputs observable
   */
  getInputs(): Observable <any> {
    return this.inputsSubject.asObservable();
  }

  /**
   * @brief
   *  Sales observable
   */
  getSales(): Observable <any> {
    return this.salesLogSubject.asObservable();
  }

  /**
   * @brief
   *  Get motor speed observable
   */
  getSpeed(): Observable <any> {
    return this.motorSpeedSubject.asObservable();
  }

  /**
   * @brief
   *  Sales observable
   */
  getSalesCount(): Observable <any> {
    return this.totalSalesLogSubject.asObservable();
  }

  /**
   * @brief
   *  Toppings amount observable
   */
  getToppingsAmount() : Observable <any> {
    return this.toppingsAmountSubject.asObservable();
  }
  
  /**
   * @brief
   *  Restore external IO module values
   */
  public restoreValues(){
    // Restore GPIOs
    for (let index = 0 ; index < PLC_IO.PLC_MAX_PINS ; index++) {
      if( this.tom.outputs[index] ){
        this.setGPIO(index, false);
      }
    }

    // Restore PWMs
    for (let index = PWM_CHANNELS.PWM_CH_1 ; index <= PWM_CHANNELS.PWM_CH_4 ; index++) {
      this.setPWM(index, TOPPING_PWM_LV.TOPPING_LV_OPEN);
    }
  }

  /**
   * @brief
   *  Send PLC command
   * 
   * @param command 
   *  PLC command, see @var{PLC_COMMANDS}
   * @note
   *  Up to 2 bytes
   * 
   * @param ex1 
   *  Complementary data 1
   * @note
   *  Up to 2 bytes
   * 
   * @param ex2 
   *  Complementary data 2
   * @note
   *  Up to 8 bytes
   */
  public sendCommand(command: any, ex1: any = 0, ex2: any = 0){ 
    // Case: Socket busy
    if( this.isElectron && this.conStatus.tcpClient && (this.conStatus.tcpClientPend || this.tcpPendBuffSize > 0) ){
      let self = this;

      // Case: Full buffer
      if(this.tcpPendBuffSize == this.tcpPendBuffMax){
        //console.log("Socket full");
        $(function() {
          setTimeout(function() {
            self.sendCommand(command, ex1, ex2);
          },50);
        })
      }
      // Case: Buffer available
      else{
        //console.log("Inserting in buffer");
        this.tcpPendBuffSize ++;  

        this.tcpPendBuff[this.tcpPendBuffPosW].command = command;
        this.tcpPendBuff[this.tcpPendBuffPosW].ex1 = ex1;
        this.tcpPendBuff[this.tcpPendBuffPosW].ex2 = ex2;

        this.tcpPendBuffPosW ++;

        if(this.tcpPendBuffPosW == this.tcpPendBuffMax){
          this.tcpPendBuffPosW = 0;
        }
      }
    }
    // Case: Socket available
    else if (this.isElectron && this.conStatus.tcpClient) {

      this.conStatus.tcpClientPend = true;
      this.writeCommand(command, ex1, ex2);
    }
    // Case: Socket not connected
    else if(this.isElectron && !this.conStatus.tcpClient){
      //console.log("Socket not connected");
      let self = this;

      $(function() {
        setTimeout(function() {
          self.sendCommand(command, ex1, ex2);
        },1000);
      })
    }
  }

  /**
   * @brief
   *  Send PLC command (Primitive)
   * 
   * @param command 
   *  PLC command, see @var{PLC_COMMANDS}
   * @note
   *  Up to 2 bytes
   * 
   * @param ex1 
   *  Complementary data 1
   * @note
   *  Up to 2 bytes
   * 
   * @param ex2 
   *  Complementary data 2
   * @note
   *  Up to 8 bytes
   */
  public writeCommand(command: any, ex1: any = 0, ex2: any = 0){
    ///< Modify offsets to your needs
    this.tcpTx.writeUInt16LE(command, 0);
    this.tcpTx.writeUInt16LE(ex1, 2);
    this.tcpTx.writeUInt32LE(ex2, 4);    

    this.portNet.write(this.tcpTx);
  }

  /**
   * @brief
   *  Set PWM duty cycle,
   * 
   * @param number
   *  Channel number (1-4) see @var{PWM_CHANNELS}
   * 
   * @param dutyCyle 
   *  Duty cyle (1us - 1000us)
   */
  public setPWM(channel: PWM_CHANNELS, dutyCyle: number){
    this.sendCommand(PLC_COMMANDS.PLC_CMD_PWM, channel, dutyCyle);
  }

  /**
   * @brief
   *  Set all PWM channels with the duty cycle @var{dutyCycle}
   * 
   * @param dutyCyle 
   *  PWM duty cycle
   */
  public setAllPWM(dutyCyle: number){
    for (let index = PWM_CHANNELS.PWM_CH_1 ; index <= PWM_CHANNELS.PWM_MAX_CHANNELS ; index++) {
      this.setPWM(index, dutyCyle);
    }
  }

  /**
   * @brief
   *  Start PWM with duty cyle @var{startDutyCyle} and after time @var{timeout} in ms 
   *  will set duty cycle @var{endDutyCyle}
   * 
   * @param channel 
   *  Channel number (1-4) see @var{PWM_CHANNELS}
   * 
   * @param startDutyCyle 
   *  First duty cyle (1us - 1000us)
   * 
   * @param endDutyCyle 
   *  Last duty cyle (1us - 1000us)
   * 
   * @param timeout 
   *  Time in ms
   */
  public setTimerPWM(channel: PWM_CHANNELS, startDutyCyle: number, endDutyCyle: number, timeout: number){
    let self = this;

    this.setPWM(channel, startDutyCyle);

    $(function() {
      setTimeout(function() {
        self.setPWM(channel, endDutyCyle);
      },timeout);
    })
  }

  /**
   * @brief
   *  Turn ON / OFF a GPIO
   * 
   * @param pin 
   *  Pin number see @var{PLC_IO}
   * 
   * @param status 
   *  true -> ON
   *  false -> OFF
   */
  public setGPIO(pin: PLC_IO, status: boolean){
    this.sendCommand(PLC_COMMANDS.PLC_CMD_OUT, status ? 1 : 0, pin);
    this.tom.outputs[pin] = status;
  }

  /**
   * @brief
   *  Set all GPIO status with status @var{status}
   *  
   * @param status 
   *  true -> ON
   *  false -> OFF
   */
  public setAllGPIO(status: boolean){
    for (let index = 0 ; index < PLC_IO.PLC_MAX_PINS ; index++) {
      this.setGPIO(index, status);
    }
  }

  /**
   * @brief
   *  Turn ON / OFF a GPIO, after time @var{timeout} will toggle the GPIO
   * 
   * @param pin 
   * Pin number see @var{PLC_IO}
   * 
   * @param status
   *  true -> ON
   *  false -> OFF
   *  
   * @param timeout 
   * Time in ms
   */
  public setTimerGPIO(pin: PLC_IO, status: boolean, timeout: number){
    let self = this;

    this.setGPIO(pin, status);

    $(function() {
      setTimeout(function() {
        self.setGPIO(pin, !status);
      },timeout);
    })
  } 

  /**
   * @brief
   *  Initialize the PLC client
   */
  public initPlcClient(){
    this.sendCommand(PLC_COMMANDS.PLC_CMD_CLIENT);
  }
}
