import {Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
import { GlobalTomDataService } from '../../services/global-tom-data.service';
import { Router } from '@angular/router';

import * as $ from 'jquery';
import { TomData, PLC_IO, SLICES, PWM_CHANNELS, toppingSale } from '../../core/templates/main';

import { FlavourList } from '../../core/templates/flavour';
import { Toasted_List } from '../../core/templates/toasted';

import { MOTOR_DIR, MOTORS, MOTOR_DIR_TIMEOUT, StateMachine, SYS_LOGS } from './extra/utils';
import { MAIN_STATE_MACHINE, TOASTING_STATE_MACHINE, TOPPING_STATE_MACHINE, 
         APPLY_STATE_MACHINE, CHECKPOINTS, EV_WAIT_SET, STATE_MACHINES,
         MOTOR_GPIOS_L, counter } from './extra/utils';

import { timeoutMotorEvent, inputsEvent, EVENTS, EV_ST, stateMachineEvent, timerGpioEvent, pwmEvent } from './extra/event-types';
import { STRING_TYPE } from '@angular/compiler';


@Component({
  selector: 'app-cooking',
  styleUrls: ['./cooking.component.scss'],
  templateUrl: './cooking.component.html',  
})


export class CookingComponent implements OnInit, AfterViewInit {
  //** Non system objects **//
  private logs: boolean[] = new Array(SYS_LOGS.LOG_MAX); /// System logs array

  //** System objects **//
  private tomObject: TomData; // TOM object
  private FSM: StateMachine = new StateMachine; // FSM machine
  private dispatcher: any = $({}); // Event dispatcher
  private jCounter: counter = new counter; // Main jQuery counter
  private jAuxCounter: counter = new counter; // Auxiliary jQuery counter
  private flavousNumber: number; // Flavours number
  
  //process views flags:
  screenStep = {insert:false,process:true,ready:true};

  /**
   * @brief
   *  Cooking constructor
   * 
   * @param tomService 
   *  Main service provider
   * 
   * @param router 
   *  Used for pages routing
   * 
   * @param zone 
   *  Used when a GUI forced update is required
   */
  constructor(private tomService : GlobalTomDataService,private router: Router, private zone:NgZone) { }

  ngOnInit() {

    this.processViewHandler();
    //** Logic init **//
    this.initVar();
    this.initEventHandlers();
    this.initServices();            
    this.tomService.getMotorSpeed(); // Get motor speed
    this.tomService.restoreValues(); // Restore GPIO module values

    //** GUI init **//
    this.initStepper();
    this.initVideoControl();       
  }

  ngAfterViewInit(){ 
    this.dispatcher.trigger( this.FSM.events.checkStateMachine, null ); // Start FSM
  }

  /**************/
  /* Init Utils */
  /**************/

  /**
   * @brief
   *  Initialize variables
   */
  private initVar(){
    this.setExclusiveEv(EVENTS.EV_STATE_MACHINE); // Set state machine event as exclusive

    // Initialize slice position
    for (let index = 0 ; index < SLICES.SLICES_MAX ; index++ ) {
      this.FSM.compute.slicePos[index] = 0;
      this.FSM.compute.sliceSet[index] = false;
    }

    //** Logs enable/disable **//
    this.logs[ SYS_LOGS.LOG_FSM_MAIN ] = false; ///< Enable / Disable MAIN FSM step footprints
    this.logs[ SYS_LOGS.LOG_FSM_TOAST ] = false; ///< Enable / Disable TOASTING FSM step footprints
    this.logs[ SYS_LOGS.LOG_FSM_TOPPING ] = false; ///< Enable / Disable TOPPING FSM step footprints
    this.logs[ SYS_LOGS.LOG_FSM_INFO ] = true; ///< Enable / Disable general FSM information log
  }

  /**
   * @brief
   *  Init all services
   */
  private initServices(){
    // TOM general structure
    this.tomService.cast.subscribe( tomSubject => { 
      this.tomObject=tomSubject;
    });

    // Inputs structure
    this.tomService.getInputs().subscribe(inputs => { 
      this.tomObject.inputs = inputs; // Update internal
      this.tomService.updateTom(this.tomObject); // Update in all components
      this.validateReadySens( this.tomObject.inputs[ PLC_IO.PLC_IN_MUFFIN_OUT ] ); // Validate Muffin Out sensor
      this.dispatcher.trigger(this.FSM.events.inputs, [inputs]);  // Notify new inputs event
    });

    // Motor speed
    this.tomService.getSpeed().subscribe(speed => {
      this.updateMotorSpeed(speed); // Update motor speed
    });
  }

  /**
   * @brief
   *  Update motor speed from observable
   * 
   * @param speed 
   *  Motor speed
   */
  private updateMotorSpeed(speed: number){
    this.FSM.compute.motorSpeed = speed;
  }

  /**
   * @brief
   *  Initialize event handlers
   */
  private initEventHandlers(){
    let self = this;

    // Timeout motor event
    this.dispatcher.on(this.FSM.events.timeoutMotor,
      function(handle: any, timeout: MOTOR_DIR_TIMEOUT, motor: MOTORS, dir: MOTOR_DIR){
        let contents: timeoutMotorEvent = {
          timeout: timeout,
          motor: motor,
          dir: dir,
          id: EVENTS.EV_MOTOR,
        }

        self.stateMachine(contents);
    });

    // Inputs event
    this.dispatcher.on( this.FSM.events.inputs, function(handle: any, inputs: boolean[] ){
      let contents: inputsEvent = {
        inputs: inputs,
        id: EVENTS.EV_INPUTS,
      }
      
      self.stateMachine(contents);
    });

    // State machine event
    this.dispatcher.on( this.FSM.events.checkStateMachine, function(handle: any, data: any ){
      let contents: stateMachineEvent = {
        contents: data,
        id: EVENTS.EV_STATE_MACHINE,
      }

      self.stateMachine(contents);
    });

    // GPIO out event
    this.dispatcher.on( this.FSM.events.gpioOut, function(handle: any, gpio: PLC_IO ){
      let contents: timerGpioEvent = {
        gpio: gpio,
        id: EVENTS.EV_GPIO_OUT,
      }

      self.stateMachine(contents);
    });

    // PWM timeout event
    this.dispatcher.on( this.FSM.events.pwm, function(handle: any, pwm: PWM_CHANNELS ){
      let contents: pwmEvent = {
        channel: pwm,
        id: EVENTS.EV_PWM,
      }

      self.stateMachine(contents);
    });
  }

  /**
   * @brief
   *  Initialize stepper
   */
  private initStepper(){
    $('.wizard li').click(function() {
      $(this).prevAll().addClass("completed");
       $(this).nextAll().removeClass("completed")
     
     });
  }

  /**
   * @brief
   *  Initialize video control
   */
  private initVideoControl(){
    $(function() {
      var $videos = $("#playlist li");
      var $video = $("#videoarea");
      var current = 0;
      var max = 7;
      
      function playVideo(video) {
          current = elIndex($videos, video);
          if (current == undefined) {
              return false;
          }
          $video.attr({
              "src": $(video).attr("movieurl"),
              "autoplay": "autoplay",
              "type": "video/mp4",
          })
      }
      
      $video.attr({
          "src": $videos.eq(current).attr("movieurl"),
          "autoplay": "autoplay",
          "type": "video/mp4",
      })
      
      $video.on('ended', function () {
        if (current == max) {
            playVideo($videos[0]);
          } else {
            playVideo($videos[current + 1]);
          }
      });
      
      function elIndex(parent, el) {
          for (var i = 0; i < parent.length; i += 1) {
              if (parent[i] === el) {
                return i;   
              }
          }
          
          return null;
      }
    })
  }

  /**
   * @brief
   *  Set welcome route
   */
  private setWelcomeRoute(){
    this.router.navigate(['/pages/welcome']);
  }

  /*********/
  /* Utils */
  /*********/

  /**
   * @brief
   *  Validate when a muffin slice is ready
   * 
   * @param status
   *  
   */
  private validateReadySens(status: boolean){
    if( this.FSM.ignoreReadySens ){
      return;
    }
    else if( !this.FSM.readySensTrigger.prevStatus && status ){
      this.FSM.readySensTrigger.prevStatus = true;
    }
    else if( this.FSM.readySensTrigger.prevStatus && !status ){
      this.FSM.readySensTrigger.prevStatus = false;
      this.FSM.readySensTrigger.counter ++;
    }
  }

  /**
   * @brief
   *  Set the event listening mode to one exclusive event
   * 
   * @param exEvent 
   *  Event to listen
   */
  private setExclusiveEv(exEvent: EVENTS){
    let evStatus: EV_ST[] = 
      [ 
        { status: EV_WAIT_SET.EV_IGNORE_EVENT, id: EVENTS.EV_MOTOR },
        { status: EV_WAIT_SET.EV_IGNORE_EVENT, id: EVENTS.EV_INPUTS },        
        { status: EV_WAIT_SET.EV_IGNORE_EVENT, id: EVENTS.EV_STATE_MACHINE },
        { status: EV_WAIT_SET.EV_IGNORE_EVENT, id: EVENTS.EV_GPIO_OUT },
        { status: EV_WAIT_SET.EV_IGNORE_EVENT, id: EVENTS.EV_PWM },
      ];

    evStatus[exEvent].status = EV_WAIT_SET.EV_WAIT_FOR_EVENT;

    this.setWaitingEv(evStatus);
  }

  /**
   * @brief
   *  Timer interrupt function
   */
  private timerInt(){
    this.jCounter.count += this.jCounter.interval;
  }

  /**
   * @brief
   *  Aux Timer interrupt function
   */
  private timerAuxInt(){
    this.jAuxCounter.count += this.jAuxCounter.interval;
  }

  /**
   * @brief
   *  Start/Stop jQuery timer
   * 
   * @param status 
   *  true -> Start timer
   *  false -> Stop timer
   */
  private startTimer(status: boolean){
    let self = this;

    if(status){
      this.jCounter.count = 0;  
      this.jCounter.interval = 10; ///< 10 will run it every 100th of a second (10 ms)        
      this.jCounter.status = true;

      $(function() {
        self.jCounter.handler = setInterval(function() {
          self.timerInt();
        }, self.jCounter.interval); 
      })
    }
    else{
      this.jCounter.status = false;
      $(function() {
        clearInterval(self.jCounter.handler);
      })
    }      
  }

  /**
   * @brief
   *  Start/Stop jQuery aux timer
   * 
   * @param status 
   *  true -> Start timer
   *  false -> Stop timer
   */
  private startAuxTimer(status: boolean){
    let self = this;

    if(status){
      this.jAuxCounter.count = 0;  
      this.jAuxCounter.interval = 10; ///< 10 will run it every 100th of a second (10 ms)        
      this.jAuxCounter.status = true;

      $(function() {
        self.jAuxCounter.handler = setInterval(function() {
          self.timerAuxInt();
        }, self.jAuxCounter.interval); 
      })
    }
    else{
      this.jAuxCounter.status = false;
      $(function() {
        clearInterval(self.jAuxCounter.handler);
      })
    }     
  }

  /**
   * Move the motor to a checkpoint
   * @param startCheckpoint 
   *  Start checkpoint
   * 
   * @param endCheckpoint 
   *  End checkpoint
   */
  private movToCheckpoint(startCheckpoint: CHECKPOINTS, endCheckpoint: CHECKPOINTS){
    if( this.logs[ SYS_LOGS.LOG_FSM_INFO ] ){
      let startName: string = this.getCheckpointName(startCheckpoint);
      let endName: string = this.getCheckpointName(endCheckpoint);

      this.infoLog( "[INFO-LOG]: Moving from " + startName + " to " + endName );
    }

    let movTime: number = this.FSM.compute.computeTime( startCheckpoint, endCheckpoint, this.logs[ SYS_LOGS.LOG_FSM_INFO ] );
    let distance: number = this.FSM.compute.computeDistance(movTime);

    this.infoLog( "[INFO-LOG]: Moving time: " + String(movTime) + "ms" );
    this.infoLog( "[INFO-LOG]: Distance: " + String(distance) + "mm" );

    let dir: MOTOR_DIR = (movTime >= 0) ? MOTOR_DIR.MOTOR_D_FORWARD : MOTOR_DIR.MOTOR_D_BACKWARDS;

    this.infoLog( "[INFO-LOG]: Direction: " + this.getDirName(dir) );

    for ( let index = 0 ; index < SLICES.SLICES_MAX ; index++ ) {
      if( this.FSM.compute.sliceSet[index] ){
        this.FSM.compute.slicePos[index] += distance;
        this.infoLog( "[INFO-LOG]: Slice[ " + String(index) + "]" + " updated to " +  this.FSM.compute.slicePos[index] + "mm");
      }
    }

    let extraTime: number = 250; ///< Extra motor ON time ( Communication time + acceleration ) in ms
    let motorOnTime: number = Math.round( Math.abs(movTime) + extraTime );

    this.setMotorDir( MOTORS.MOTOR_TOPPING, dir, MOTOR_DIR_TIMEOUT.MOTOR_DT_STOP, motorOnTime );
  }

  /**
   * @brief
   *  Return the checkpoint name
   * 
   * @param startCheckpoint 
   *  Start checkpoint
   * 
   * @param endCheckpoint 
   *  End checkpoint
   */
  private getCheckpointName(checkpoint: CHECKPOINTS){
    switch(checkpoint){
      case CHECKPOINTS.CHECKPOINT_TOPPING_1:
        return "Topping 1";
        
      case CHECKPOINTS.CHECKPOINT_TOPPING_2:
        return "Topping 2";

      case CHECKPOINTS.CHECKPOINT_TOPPING_3:
        return "Topping 3";

      case CHECKPOINTS.CHECKPOINT_TOPPING_4:
        return "Topping 4";

      case CHECKPOINTS.CHECKPOINT_SENSOR:
        return "Sensor";

      case CHECKPOINTS.CHECKPOINT_SLICE_A:
        return "Slice A";

      case CHECKPOINTS.CHECKPOINT_SLICE_B:
        return "Slice B";
    }
  }

  /**
   * @brief
   *  Get motor direction name
   * 
   * @param dir 
   *  Motor direction
   */
  private getDirName(dir: MOTOR_DIR){
    switch(dir){
      case MOTOR_DIR.MOTOR_D_FORWARD:
        return "Forward";

      case MOTOR_DIR.MOTOR_D_BACKWARDS:
        return "Backwards";

      case MOTOR_DIR.MOTOR_D_STOP:
        return "Stop";
    }
  }

  /**
   * @brief
   *  Return an array in with the motor GPIO, position values are as @enum{MOTOR_GPIOS_L}
   * 
   * @param motor 
   * Motor ID
   * 
   * @param dir 
   *  Direction
   * 
   * @return
   *  Returns a @type{ PLC_IO[] }
   */
  private getMotorGpios(motor: MOTORS, dir: MOTOR_DIR){
    let onPin: PLC_IO;
    let offPin: PLC_IO;

    switch(motor){
      case MOTORS.MOTOR_TOAST:
        if( dir == MOTOR_DIR.MOTOR_D_FORWARD ){
          onPin = PLC_IO.PLC_OUT_MOTOR_TOAST_FWD;
          offPin = PLC_IO.PLC_OUT_MOTOR_TOAST_BCK;
        }
        else{
          onPin = PLC_IO.PLC_OUT_MOTOR_TOAST_BCK;
          offPin = PLC_IO.PLC_OUT_MOTOR_TOAST_FWD;
        }
        break;

      case MOTORS.MOTOR_TOPPING:
        if( dir == MOTOR_DIR.MOTOR_D_FORWARD ){
          onPin = PLC_IO.PLC_OUT_MOTOR_TOPPING_FWD;
          offPin = PLC_IO.PLC_OUT_MOTOR_TOPPING_BCK;
        }
        else{
          onPin = PLC_IO.PLC_OUT_MOTOR_TOPPING_BCK;
          offPin = PLC_IO.PLC_OUT_MOTOR_TOPPING_FWD;
        }
        break;
    }

    return [ onPin, offPin ];
  }

  /**
   * @brief
   *  Change motor direction
   * 
   * @param motor
   *  Motor ID
   * 
   * @param dir 
   *  Motor direction
   * 
   * @param timeoutType
   *  Timeout type, see @var{MOTOR_DIR_TIMEOUT}
   * 
   * @param timeout
   *  Timeout in ms, you must provide a timeout when the @var{timeoutType} is not MOTOR_DT_NO_TIMEOUT
   */
  private setMotorDir(motor: MOTORS, dir: MOTOR_DIR, timeoutType: MOTOR_DIR_TIMEOUT 
                      = MOTOR_DIR_TIMEOUT.MOTOR_DT_NO_TIMEOUT, timeout: number = 0){
    
    let motorPins: PLC_IO[] = this.getMotorGpios(motor, dir);

    // Special case: Timeout is desired but the specified timeout is 0
    if(timeoutType == MOTOR_DIR_TIMEOUT.MOTOR_DT_STOP && timeout == 0){
      this.infoLog( "[INFO-LOG]: Motor timeout desired, but time is 0");

      this.setMotorPin( motorPins[ MOTOR_GPIOS_L.MOTOR_GPIO_OFF ], false);
      this.setMotorPin( motorPins[ MOTOR_GPIOS_L.MOTOR_GPIO_ON ], false);

      let self = this;

      // Small wait to let the motor to stop completely
      $(function() {
        setTimeout(function() {
          self.dispatcher.trigger(self.FSM.events.timeoutMotor, [timeoutType, motor, dir]);
        },1000);
      })
      return;
    }

    this.infoLog( "[INFO-LOG]: Motor ON[" + String( motorPins[ MOTOR_GPIOS_L.MOTOR_GPIO_ON ] ) + "] OFF[" +
                  String(motorPins[ MOTOR_GPIOS_L.MOTOR_GPIO_OFF ] + "]" ) );

    // Activate motor
    this.setMotorPin( motorPins[ MOTOR_GPIOS_L.MOTOR_GPIO_OFF ], false);
    this.setMotorPin( motorPins[ MOTOR_GPIOS_L.MOTOR_GPIO_ON ], true);
    
    // Timeoout stop case
    if(timeoutType == MOTOR_DIR_TIMEOUT.MOTOR_DT_STOP){
      let self = this;
      
      $(function() {
        setTimeout(function() {
          self.tomService.setGPIO( motorPins[ MOTOR_GPIOS_L.MOTOR_GPIO_ON ] , false);
          self.dispatcher.trigger(self.FSM.events.timeoutMotor, [timeoutType, motor, dir]);
        },timeout);
      })
    }
    else if(timeoutType == MOTOR_DIR_TIMEOUT.MOTOR_DT_TOGGLE){
      if(timeout == 0){
        return;
      }

      let self = this;
      let motorDir = dir == MOTOR_DIR.MOTOR_D_BACKWARDS ? MOTOR_DIR.MOTOR_D_FORWARD: MOTOR_DIR.MOTOR_D_BACKWARDS

      $(function() {
        setTimeout(function() {
          self.setMotorDir(motor, motorDir);
          self.dispatcher.trigger(self.FSM.events.timeoutMotor, [timeoutType, motor, motorDir]);
        },timeout);
      })
    }
  }

  /**
   * @brief
   *  Set the motor pin status when then pin is not in the desired status
   * 
   * @param pin 
   *  Motor pin
   * 
   * @param status 
   *  New pin status
   */
  private setMotorPin(pin: PLC_IO, status: boolean){
    if( this.tomObject.outputs[pin] != status ){
      this.tomService.setGPIO(pin, status);
    }
  }

  /**
   * @brief
   *  Set the event(s) status
   * 
   * @param status 
   *  Status of the event, see @type{EV_ST}
   */
  private setWaitingEv( status: EV_ST[] ){
    for (let index = 0 ; index < status.length ; index++) {      

      if( status[index].status == EV_WAIT_SET.EV_IGNORE_EVENT ) {
        this.FSM.waitingEv[ status[index].id ] = false;
      }
      else if( status[index].status == EV_WAIT_SET.EV_WAIT_FOR_EVENT ) {
        this.FSM.waitingEv[ status[index].id ] = true;
      }

    }
  }

  /**
   * @brief
   *  Validate event
   * 
   * @param params 
   *  Event data
   */
  private checkEvent(params){
    if(params == null){
      return false;
    }

    switch(params.id){
      case EVENTS.EV_MOTOR:
        return this.FSM.waitingEv[EVENTS.EV_MOTOR];

      case EVENTS.EV_INPUTS:
        return this.FSM.waitingEv[EVENTS.EV_INPUTS];

      case EVENTS.EV_STATE_MACHINE:
        return this.FSM.waitingEv[EVENTS.EV_STATE_MACHINE];

      case EVENTS.EV_GPIO_OUT:
        return this.FSM.waitingEv[EVENTS.EV_GPIO_OUT];

      case EVENTS.EV_PWM:
        return this.FSM.waitingEv[EVENTS.EV_PWM];
    }
  }

  /**
   * @brief 
   *  Set a timered GPIO
   * 
   * @param pin 
   *  PLC pin
   * 
   * @param status 
   *  true - ON
   *  false - OFF
   * 
   * @param timeout 
   *  Timeout to toogle @var{status} in ms
   * 
   * @param notify
   *  True -> Execute GPIO OUT event on timeout
   *  False -> Do not execute GPIO OUT event on timeout
   */
  private setTimerGPIO(pin: PLC_IO, status: boolean, timeout: number, notify: boolean = true){
    this.tomService.setTimerGPIO(pin, status, timeout);

    let self = this;

    if(notify){
      $(function() {
        setTimeout(function() {
          self.dispatcher.trigger(self.FSM.events.gpioOut, [pin]);
        },timeout);
      })
    }
  }

  /**
   * @brief
   *  Set the PWM channel with duty cycle @var{startDutyCyle}, after timeout @var{timeout} the duty cycle will
   *  be changed to @var{endDutyCyle}
   * 
   * @param channel 
   *  PWM channel
   * 
   * @param startDutyCyle 
   *  First duty cycle
   * 
   * @param endDutyCyle 
   *  Last duty cycle
   * 
   * @param timeout 
   *  Timeout to toggle the duty cycle in ms
   * 
   * @param extraTimeout 
   * @note Optional value
   *  Extra time in ms after timeout before emiting the pwm event
   */
  private setTimerPWM(channel: PWM_CHANNELS, startDutyCyle: number, endDutyCyle: number, timeout: number, extraTimeout: number = 0){
    this.infoLog("[INFO-LOG]: PWM " + String(channel) + " from " + String(startDutyCyle) + " to " + String(endDutyCyle) + " of Duty Cycle");
    this.infoLog("[INFO-LOG]: PWM " + String(channel) + " with timeout " + String(timeout) + "ms with extra timeout of " + String(extraTimeout) + "ms");

    this.tomService.setTimerPWM(channel, startDutyCyle, endDutyCyle, timeout);

    let self = this;

    $(function() {
      setTimeout(function() {
        self.dispatcher.trigger(self.FSM.events.pwm, [channel]);
      }, timeout + extraTimeout);
    })
  }

  /**
   * @brief
   *  Move any motor or all motors in one direction
   * 
   * @param motor 
   *  Motor
   * 
   * @param dir 
   *  Direction
   */
  private moveMotors(motor: MOTORS, dir: MOTOR_DIR){
    if(motor == MOTORS.MOTOR_ALL || motor == MOTORS.MOTOR_MAX){
      this.setMotorDir(MOTORS.MOTOR_TOAST, dir);
      this.setMotorDir(MOTORS.MOTOR_TOPPING, dir);  
    }
    else{
      this.setMotorDir(motor,dir);  
    }
  }

  private stopMotors(motor: MOTORS){
    let index: MOTORS;
    let maxIndex: MOTORS;
    let motorPins: PLC_IO[];

    if(motor == MOTORS.MOTOR_ALL || motor == MOTORS.MOTOR_MAX){
      index = 0;
      maxIndex = MOTORS.MOTOR_MAX - 1;
    }
    else{
      index = motor;
      maxIndex = motor;
    }

    for ( index ; index <= maxIndex ; index++ ) {
      motorPins = this.getMotorGpios(index, MOTOR_DIR.MOTOR_D_STOP);

      if( this.tomObject.outputs[ motorPins[ MOTOR_GPIOS_L.MOTOR_GPIO_STOP_1 ] ] ){
        this.tomService.setGPIO( motorPins[ MOTOR_GPIOS_L.MOTOR_GPIO_STOP_1 ], false);
      }
      
      if( this.tomObject.outputs[ motorPins[ MOTOR_GPIOS_L.MOTOR_GPIO_STOP_2 ] ] ){
        this.tomService.setGPIO( motorPins[ MOTOR_GPIOS_L.MOTOR_GPIO_STOP_2 ] , false);
      }
    }    
  }

  /********/
  /* Main */
  /********/

  /**
   * @brief 
   *  Prints toasting logs if required by @var{printToastLog}
   * 
   * @param printCont
   *  Data to print
   */
  private mainLog(printCont: any){
    if( this.logs[ SYS_LOGS.LOG_FSM_MAIN ] ){
      console.log(printCont);
    }
  }

  /**
   * @brief
   *  Main state machine contents
   * 
   * @param params 
   *  Event parameters
   */
  private stateMachine(params: any = null){
    if( !this.checkEvent(params) ){
      return false;
    }

    switch( this.FSM.main ){
      case MAIN_STATE_MACHINE.MAIN_SM__WAITING:
        this.mainLog("[FSM-MAIN]: MAIN_SM__WAITING");
        this.fsmInit(params);
        return true;

      case MAIN_STATE_MACHINE.MAIN_SM__TOASTING:
        this.mainLog("[FSM-MAIN]: MAIN_SM__TOASTING");
        this.toastingStateMachine(params);
        return true;

      case MAIN_STATE_MACHINE.MAIN_SM__TOPPING:
        this.mainLog("[FSM-MAIN]: MAIN_SM__TOPPING");
        this.toppingStateMachine(params);
        return true;

      case MAIN_STATE_MACHINE.MAIN_SM__FINISHING:
        this.resetVar();        
        this.mainLog("[FSM-MAIN]: MAIN_SM__FINISHING");

        // TODO set thanks message or something

        this.triggerFSM( STATE_MACHINES.FSM_MAIN, MAIN_STATE_MACHINE.MAIN_SM__FINISHED , true );

        this.infoLog("[INFO-LOG]: Variables reset, all muffins dispatched");

        // TODO after a while return to welcome page
        // this.router.navigate(['/pages/welcome']);

        this.FSM.main = MAIN_STATE_MACHINE.MAIN_SM__FINISHED;
        return true;
    }

    return false;
  }

  /**
   * @brief
   *  FSM init process
   * 
   * @param params 
   *  Event parameters
   */
  private fsmInit(params: any = null){
        ///< @note 
        ///   Insert init code here if required

        this.flavousNumber = this.getFlavoursNumber(); ///< Get flavours number
        this.FSM.oneFlavourMode = ( ( this.flavousNumber == 1 ) ? true : false );  ///< Get flavour mode

        this.infoLog("[INFO-LOG]: Toppings count: " + String(this.flavousNumber) );

        this.updateDb(); ///<  Update sales and amount DB
        this.triggerFSM( STATE_MACHINES.FSM_MAIN, MAIN_STATE_MACHINE.MAIN_SM__TOASTING );
  }

  /**
   * @brief
   *  Toasting state machine
   * 
   * @param params 
   *  Event parameters
   */
  private toastingStateMachine(params: any = null){
    switch( this.FSM.toasting ){
      case TOASTING_STATE_MACHINE.TOASTING_SM__WAITING_SLICE_A:
        this.logToasting("[FSM-TOASTING]: TOASTING_SM__WAITING_SLICE_A");
        this.movMuffin( params, this.FSM.movFirstSliceTime, TOASTING_STATE_MACHINE.TOASTING_SM__WAITING_SLICE_B, true );
        return true;

      case TOASTING_STATE_MACHINE.TOASTING_SM__WAITING_SLICE_B:
        this.logToasting("[FSM-TOASTING]: TOASTING_SM__WAITING_SLICE_B");
        this.movMuffin( params, this.FSM.movSecondSliceTime, TOASTING_STATE_MACHINE.TOASTING_SM__TOASTING, false );
        return true;

      case TOASTING_STATE_MACHINE.TOASTING_SM__TOASTING:
        this.logToasting("[FSM-TOASTING]: TOASTING_SM__TOASTING");
        this.startToasting(params);
        return true;
    }

    return false;
  }

  /**
   * @brief
   *  Topping state machine
   * 
   * @param params 
   *  Event parameters
   */
  private toppingStateMachine(params: any = null){
    switch( this.FSM.topping ){
      case TOPPING_STATE_MACHINE.TOPPING_SM__WAITING_START:
        this.toppingLog("[FSM-MAIN-TOPPING]: TOPPING_SM__WAITING_START");
        this.validateFlavours(params);        
        return true;

      case TOPPING_STATE_MACHINE.TOPPING_SM__APPLY_TOPPING:
        this.toppingLog("[FSM-MAIN-TOPPING]: TOPPING_SM__APPLY_TOPPING");
        this.applyingStateMachine(params);
        return true;
          
      case TOPPING_STATE_MACHINE.TOPPING_SM__FINISHING:
        this.toppingLog("[FSM-MAIN-TOPPING]: TOPPING_SM__FINISHING");
        this.finishTopping(params);
        return true;
    }

    return false;
  }

  /**
   * @brief
   *  Applying state machine
   * 
   * @param params 
   *  Event parameters
   */
  private applyingStateMachine(params: any = null){
    if(this.applyingPhase1(params)){
      return true;
    }
    else if(this.applyingPhase2(params)){
      return true;
    }
    else if(this.applyingPhase3(params)){
      return true;
    }
    else if(this.applyingPhase4(params)){
      return true;
    }

    return false;
  }

  /**
   * @brief
   *  Applying phase 1 steps of APPLYING STATE MACHINE
   * 
   * @param params 
   *  Event parameters
   */
  private applyingPhase1(params: any = null){
    switch( this.FSM.applying ){

      //** Measuring muffin A **//

      case APPLY_STATE_MACHINE.APPLY_SM__SENS_A:
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__SENS_A");
        this.measureSlice(params, APPLY_STATE_MACHINE.APPLY_SM__WAITING_T1_A, SLICES.SLICE_A);
        return true;


      //** Topping 1 in muffin A **//

      case APPLY_STATE_MACHINE.APPLY_SM__WAITING_T1_A: ///< Check topping 1 
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__WAITING_T1_A");
        this.checkSkipFlavour(APPLY_STATE_MACHINE.APPLY_SM__WAITING_T2_A /*skip*/ , APPLY_STATE_MACHINE.APPLY_SM__MOVING_T1_A /*valid*/, FlavourList.Flavour_0 /*topping*/);
        return true;

      case APPLY_STATE_MACHINE.APPLY_SM__MOVING_T1_A: ///< Move muffin A to topping 1 position
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__MOVING_T1_A");   
        this.movToTopping(params, CHECKPOINTS.CHECKPOINT_SLICE_A /*start*/, CHECKPOINTS.CHECKPOINT_TOPPING_1 /*end*/, APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T1_A /*next*/, true);
        return true;

      case APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T1_A: ///< Apply topping 1 to muffin A
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__APPLYING_T1_A");  
        this.activateTopping(params, FlavourList.Flavour_0 /*topping*/, APPLY_STATE_MACHINE.APPLY_SM__WAITING_T2_A /*next*/, true);
        return true;


      //** Topping 2 in muffin A **//

      case APPLY_STATE_MACHINE.APPLY_SM__WAITING_T2_A: ///< Check topping 2
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__WAITING_T2_A");  
        this.checkSkipFlavour(APPLY_STATE_MACHINE.APPLY_SM__SENS_B /*skip*/, APPLY_STATE_MACHINE.APPLY_SM__MOVING_T2_A /*valid*/, FlavourList.Flavour_1 /*topping*/);
        return true;

      case APPLY_STATE_MACHINE.APPLY_SM__MOVING_T2_A: ///< Move muffin A to topping 2 position
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__MOVING_T2_A");  
        this.movToTopping(params, CHECKPOINTS.CHECKPOINT_SLICE_A /*start*/, CHECKPOINTS.CHECKPOINT_TOPPING_2 /*end*/, APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T2_A /*next*/, true);
        return true;

      case APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T2_A: ///< Apply topping 2 to muffin A
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__APPLYING_T2_A");  
        this.activateTopping(params, FlavourList.Flavour_1 /*topping*/, APPLY_STATE_MACHINE.APPLY_SM__SENS_B /*next*/, true);
        return true;
    }

    return false;
  }

  /**
   * @brief
   *  Applying phase 2 steps of APPLYING STATE MACHINE
   * 
   * @param params 
   *  Event parameters
   */
  private applyingPhase2(params: any = null){
    switch( this.FSM.applying ){

      //** Measuring muffin A **//
      case APPLY_STATE_MACHINE.APPLY_SM__SENS_B:
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__SENS_B");  
        this.moveLastSlice(params);
        return true;


      //** Topping 1 in muffin B **//
        
      case APPLY_STATE_MACHINE.APPLY_SM__WAITING_T1_B: ///< Check topping 1
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__WAITING_T1_B"); 
        this.checkSkipFlavour(APPLY_STATE_MACHINE.APPLY_SM__WAITING_T2_B /*skip*/, APPLY_STATE_MACHINE.APPLY_SM__MOVING_T1_B /*valid*/, FlavourList.Flavour_0 /*topping*/);
        return true;

      case APPLY_STATE_MACHINE.APPLY_SM__MOVING_T1_B: ///< Move muffin B to topping 1 position
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__MOVING_T1_B"); 
        this.movToTopping(params, CHECKPOINTS.CHECKPOINT_SLICE_B /*start*/, CHECKPOINTS.CHECKPOINT_TOPPING_1 /*end*/, APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T1_B /*next*/, true);
        return true;

      case APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T1_B:
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__APPLYING_T1_B"); ///< Apply topping 1 to muffin B
        this.activateTopping(params, FlavourList.Flavour_0 /*topping*/, APPLY_STATE_MACHINE.APPLY_SM__WAITING_T2_B /*next*/, true);
        return true;


      //** Topping 2 in muffin B **//

      case APPLY_STATE_MACHINE.APPLY_SM__WAITING_T2_B: ///< Check topping 2
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__WAITING_T2_B"); 
        this.checkSkipFlavour(APPLY_STATE_MACHINE.APPLY_SM__WAITING_T3_A /*skip*/, APPLY_STATE_MACHINE.APPLY_SM__MOVING_T2_B /*valid*/, FlavourList.Flavour_1 /*topping*/);
        return true;

      case APPLY_STATE_MACHINE.APPLY_SM__MOVING_T2_B: ///< Move muffin B to topping 2 position
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__MOVING_T2_B"); 
        this.movToTopping(params, CHECKPOINTS.CHECKPOINT_SLICE_B /*start*/, CHECKPOINTS.CHECKPOINT_TOPPING_2 /*end*/, APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T2_B /*next*/, true);
        return true;

      case APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T2_B:
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__APPLYING_T2_B"); ///< Apply topping 2 to muffin B
        this.activateTopping(params, FlavourList.Flavour_1 /*topping*/, APPLY_STATE_MACHINE.APPLY_SM__WAITING_T3_A /*next*/, true);
        return true;
    }

    return false;
  }

  /**
   * @brief
   *  Applying phase 3 steps of APPLYING STATE MACHINE
   * 
   * @param params 
   *  Event parameters
   */
  private applyingPhase3(params: any = null){
    switch( this.FSM.applying ){

      //** Topping 3 in muffin A **//

      case APPLY_STATE_MACHINE.APPLY_SM__WAITING_T3_A: ///< Check topping 3
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__WAITING_T3_A"); 
        this.checkSkipFlavour(APPLY_STATE_MACHINE.APPLY_SM__WAITING_T4_A /*skip*/, APPLY_STATE_MACHINE.APPLY_SM__MOVING_T3_A /*valid*/, FlavourList.Flavour_2 /*topping*/);
        return true;
        
      case APPLY_STATE_MACHINE.APPLY_SM__MOVING_T3_A: ///< Move muffin A to topping 3 position
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__MOVING_T3_A"); 
        this.movToTopping(params, CHECKPOINTS.CHECKPOINT_SLICE_A /*start*/, CHECKPOINTS.CHECKPOINT_TOPPING_3 /*end*/, APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T3_A /*next*/, true);
        return true;

      case APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T3_A: ///< Apply topping 3 to muffin A
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__APPLYING_T3_A"); 
        this.activateTopping(params, FlavourList.Flavour_2 /*topping*/, APPLY_STATE_MACHINE.APPLY_SM__WAITING_T4_A /*next*/, true);
        return true;


      //** Topping 4 in muffin A **//

      case APPLY_STATE_MACHINE.APPLY_SM__WAITING_T4_A: ///< Check topping 4
          this.toppingLog("[FSM-TOPPING]: APPLY_SM__WAITING_T4_A"); 
          this.checkSkipFlavour(APPLY_STATE_MACHINE.APPLY_SM__WAITING_T3_B /*skip*/, APPLY_STATE_MACHINE.APPLY_SM__MOVING_T4_A /*valid*/, FlavourList.Flavour_3 /*topping*/);
          this.FSM.ignoreReadySens = false; ///< Enable Ready sensor
          return true;
  
      case APPLY_STATE_MACHINE.APPLY_SM__MOVING_T4_A: ///< Move muffin A to topping 4 position
          this.toppingLog("[FSM-TOPPING]: APPLY_SM__MOVING_T4_A"); 
          this.movToTopping(params, CHECKPOINTS.CHECKPOINT_SLICE_A /*start*/, CHECKPOINTS.CHECKPOINT_TOPPING_4 /*end*/, APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T4_A /*next*/, true);
          return true;
  
      case APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T4_A: ///< Apply topping 4 to muffin A
          this.toppingLog("[FSM-TOPPING]: APPLY_SM__APPLYING_T4_A"); 
          this.activateTopping(params, FlavourList.Flavour_3 /*topping*/, APPLY_STATE_MACHINE.APPLY_SM__WAITING_T3_B /*next*/, true);
          return true;
    }

    return false;
  }

    /**
   * @brief
   *  Applying phase 4 steps of APPLYING STATE MACHINE
   * 
   * @param params 
   *  Event parameters
   */
  private applyingPhase4(params: any = null){
    switch( this.FSM.applying ){

      //** Topping 3 in muffin B **//

      case APPLY_STATE_MACHINE.APPLY_SM__WAITING_T3_B: ///< Check topping 3
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__WAITING_T3_B"); 
        this.checkSkipFlavour(APPLY_STATE_MACHINE.APPLY_SM__WAITING_T4_B /*skip*/, APPLY_STATE_MACHINE.APPLY_SM__MOVING_T3_B /*valid*/, FlavourList.Flavour_2 /*topping*/);
        return true;

      case APPLY_STATE_MACHINE.APPLY_SM__MOVING_T3_B: ///< Move muffin B to topping 3 position
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__MOVING_T3_B"); 
        this.movToTopping(params, CHECKPOINTS.CHECKPOINT_SLICE_B /*start*/, CHECKPOINTS.CHECKPOINT_TOPPING_3 /*end*/, APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T3_B /*next*/, true);
        return true;
        
      case APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T3_B: ///< Apply topping 3 to muffin B
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__APPLYING_T3_B"); 
        this.activateTopping(params, FlavourList.Flavour_2 /*topping*/, APPLY_STATE_MACHINE.APPLY_SM__WAITING_T4_B /*next*/, true);
        return true;
      

      //** Topping 4 in muffin B **//  

      case APPLY_STATE_MACHINE.APPLY_SM__WAITING_T4_B: ///< Check topping 4
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__WAITING_T4_B"); 
        this.checkSkipFlavour(APPLY_STATE_MACHINE.APPLY_SM__FINISHED /*skip*/, APPLY_STATE_MACHINE.APPLY_SM__MOVING_T4_B /*valid*/, FlavourList.Flavour_3 /*topping*/);
        return true;

      case APPLY_STATE_MACHINE.APPLY_SM__MOVING_T4_B: ///< Move muffin B to topping 4 position
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__MOVING_T4_B"); 
        this.movToTopping(params, CHECKPOINTS.CHECKPOINT_SLICE_B /*start*/, CHECKPOINTS.CHECKPOINT_TOPPING_4 /*end*/, APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T4_B /*next*/, true);
        return true;

      case APPLY_STATE_MACHINE.APPLY_SM__APPLYING_T4_B: ///< Apply topping 3 to muffin B
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__APPLYING_T4_B"); 
        this.activateTopping(params, FlavourList.Flavour_3 /*topping*/, APPLY_STATE_MACHINE.APPLY_SM__FINISHED /*next*/, true);
        return true;
      

      //** Topping END **// 

      case APPLY_STATE_MACHINE.APPLY_SM__FINISHED: 
        this.toppingLog("[FSM-TOPPING]: APPLY_SM__FINISHED"); 
        this.moveMotors( MOTORS.MOTOR_TOPPING, MOTOR_DIR.MOTOR_D_FORWARD );
        this.triggerFSM( STATE_MACHINES.FSM_TOPPING, TOPPING_STATE_MACHINE.TOPPING_SM__FINISHING , true );
        return true;
    }

    return false;
  }

  /**
   * @brief
   *  Reset tom variables
   */
  private resetVar(){
    this.FSM.readySensTrigger.prevStatus = false;
    this.FSM.readySensTrigger.counter = 0;

    for (let sliceIndex = 0 ; sliceIndex < SLICES.SLICES_MAX ; sliceIndex++) {

      for (let flavourIndex = 0 ; flavourIndex < this.tomObject.slice[sliceIndex].flavour.maxFlavours ; flavourIndex++) {
        this.tomObject.slice[sliceIndex].flavour.flavours[flavourIndex].id = FlavourList.Flavour_NA;
      }
      
      this.tomObject.slice[sliceIndex].toasted.id = Toasted_List.Toasted_S;
    }

  }

  //*** Toasting state machine utils ***/

  /**
   * @brief 
   *  Prints toasting logs if required by @var{printToastLog}
   * 
   * @param printCont
   *  Data to print
   */
  private logToasting(printCont: any){
    if( this.logs[ SYS_LOGS.LOG_FSM_TOAST ] ){
      console.log(printCont);
    }
  }

  /**
   * @brief
   *  Used to move the muffin slices at start
   * 
   * @param params 
   *  Event contents
   * 
   * @param movTime 
   *   Moving time in ms
   * 
   * @param nextStep 
   *  Next step of the state machine
   * 
   * @param ssrInfLamp
   *  true -> Activate INF SSR LAMP
   *  false -> Leave INF SSR LAMP as it is
   */
  private movMuffin(params: any, movTime: number, nextStep: TOASTING_STATE_MACHINE, ssrInfLamp: boolean){
    if( params.id == EVENTS.EV_STATE_MACHINE || params.id == EVENTS.EV_MOTOR ){
      this.infoLog("[INFO-LOG]: Waiting for muffin");
      this.setExclusiveEv(EVENTS.EV_INPUTS);
      return;
    }
    else if( params.id == EVENTS.EV_INPUTS && !params.inputs[PLC_IO.PLC_IN_MUFFIN_IN] ){
      return;
    }

    this.infoLog("[INFO-LOG]: Muffin detected, moving muffin for " + String(movTime) + "ms");

    this.setExclusiveEv(EVENTS.EV_MOTOR); // Wait for motor event    
    this.setMotorDir(MOTORS.MOTOR_TOAST, MOTOR_DIR.MOTOR_D_FORWARD, MOTOR_DIR_TIMEOUT.MOTOR_DT_STOP, movTime); // Move muffin
    
    // Activate INF SSR LAMP when required
    if(ssrInfLamp){
      this.infoLog("[INFO-LOG]: SSR INF lamp on for " + String(this.FSM.ssrLampInfTime) + "ms");
      
      this.tomService.setTimerGPIO(PLC_IO.PLC_OUT_SSR_LAMP_INF, true, this.FSM.ssrLampInfTime);
    }

    this.FSM.toasting = nextStep; // Change state
  }

  /**
   * @brief
   *  Start toasting process
   * 
   * @param params 
   *  Event parameters
   */
  private startToasting(params: any){
    if( params.id == EVENTS.EV_MOTOR ){

      switch( this.tomObject.slice[SLICES.SLICE_A].toasted.id ){
        case Toasted_List.Toasted_S:
          this.infoLog("[INFO-LOG]: Toasting for " + String(this.FSM.ssrLampSupTimeLow) + "ms (LOW)");
          this.setTimerGPIO(PLC_IO.PLC_OUT_SSR_LAMP_SUP, true, this.FSM.ssrLampSupTimeLow);
          break;
          
        case Toasted_List.Toasted_M:
          this.infoLog("[INFO-LOG]: Toasting for " + String(this.FSM.ssrLampSupTimeMed) + "ms (MEDIUM)");
          this.setTimerGPIO(PLC_IO.PLC_OUT_SSR_LAMP_SUP, true, this.FSM.ssrLampSupTimeMed);
          break;

        case Toasted_List.Toasted_H:
          this.infoLog("[INFO-LOG]: Toasting for " + String(this.FSM.ssrLampSupTimeHigh) + "ms (HIGH)");
          this.setTimerGPIO(PLC_IO.PLC_OUT_SSR_LAMP_SUP, true, this.FSM.ssrLampSupTimeHigh);
          break;
      }

      this.setExclusiveEv(EVENTS.EV_GPIO_OUT);
    }
    else if(params.id == EVENTS.EV_GPIO_OUT){
      this.infoLog("[INFO-LOG]: Toasting finished");

      this.FSM.toasting = TOASTING_STATE_MACHINE.TOASTING_SM__FINISHED;
      this.triggerFSM( STATE_MACHINES.FSM_MAIN, MAIN_STATE_MACHINE.MAIN_SM__TOPPING, true );
    }
  }

  //*** Topping state machine utils ***/

  private toppingLog(printCont: any){
    if( this.logs[ SYS_LOGS.LOG_FSM_TOPPING ] ){
      console.log(printCont);
    }
  }

  private activateTopping(params: any, flavour: FlavourList, nextStep: any, ignoreOther = false){
    if(params.id == EVENTS.EV_STATE_MACHINE){
      this.infoLog("[INFO-LOG]: Topping " + String(flavour + 1) + " ON");

      this.activatePwmTopping(params, flavour, ignoreOther);
    }
    else if(params.id == EVENTS.EV_PWM){
      this.infoLog("[INFO-LOG]: Topping " + String(flavour + 1) + " OFF");

      this.triggerFSM( STATE_MACHINES.FSM_APPLY, nextStep, ignoreOther );


      //** One flavour mode is being validated **//
      /*
      if(this.FSM.oneFlavourMode && !this.FSM.repeatedFlavour){
        this.activatePwmTopping(params, flavour, ignoreOther);
        this.FSM.repeatedFlavour = true;
        console.log("Second same topping !");
      }
      else{
        this.FSM.repeatedFlavour = false;
        console.log("Flavour ready!");
        this.triggerFSM( STATE_MACHINES.FSM_APPLY, nextStep, ignoreOther );
      }*/
    }
  }

  private activatePwmTopping(params: any, flavour: FlavourList, ignoreOther = false){
    if(ignoreOther){
      this.setExclusiveEv(EVENTS.EV_PWM);
    }
    else{
      this.setWaitingEv( 
        [ 
          { status: EV_WAIT_SET.EV_WAIT_FOR_EVENT, id: EVENTS.EV_PWM },
        ]
      );
    }

    let pwmChannel: PWM_CHANNELS;

    switch(flavour){
      case FlavourList.Flavour_0:
        pwmChannel = PWM_CHANNELS.PWM_TOPPING_1;
        break;

      case FlavourList.Flavour_1:
        pwmChannel = PWM_CHANNELS.PWM_TOPPING_2;
        break;

      case FlavourList.Flavour_2:
        pwmChannel = PWM_CHANNELS.PWM_TOPPING_3;
        break;

      case FlavourList.Flavour_3:
        pwmChannel = PWM_CHANNELS.PWM_TOPPING_4;
        break;
    }

    this.setTimerPWM(pwmChannel, this.FSM.toppingClosePwm, this.FSM.toppingOpenPwm, this.FSM.toppingTimeout, this.FSM.extraToppingTime);
  }

  /**
   * @brief
   *  Move to checkpoint 
   * 
   * @param startCheckpoint 
   *  Start checkpoint
   * 
   * @param endCheckpoint 
   *  End checkpoint
   * 
   * @param ignoreOther 
   */
  private movToTopping(params: any, startCheckpoint: CHECKPOINTS, endCheckpoint: CHECKPOINTS, nextStep: any, ignoreOther: boolean = false){
    if(params.id == EVENTS.EV_STATE_MACHINE){
      if(ignoreOther){
        this.setExclusiveEv(EVENTS.EV_MOTOR);
      }
      else{
        this.setWaitingEv( 
          [ 
            { status: EV_WAIT_SET.EV_WAIT_FOR_EVENT, id: EVENTS.EV_MOTOR },
          ]
        );
      }

      this.movToCheckpoint(startCheckpoint, endCheckpoint);
    }
    else if(params.id == EVENTS.EV_MOTOR){
      this.setExclusiveEv(EVENTS.EV_STATE_MACHINE);
      this.infoLog("[INFO-LOG]: End checkpoint reached");

      let self = this;
      
      // Set next step after some time in order to let the topping motor to stop
      $(function() {
        setTimeout(function() {
          self.triggerFSM( STATE_MACHINES.FSM_APPLY, nextStep, ignoreOther );
        }, 500);
      })
    }
  }

  /**
   * @brief
   *  Return the toppings number
   * 
   * @note
   *  The application is considered to set the same amount of toppings for slice A and B
   */
  private getFlavoursNumber(){
    let amount: number = 0;

    for (let index = 0 ; index < this.tomObject.slice[SLICES.SLICE_A].flavour.maxFlavours ; index++) {
      amount += ( ( this.tomObject.slice[SLICES.SLICE_A].flavour.flavours[index].id == FlavourList.Flavour_NA ) ? 0 : 1 );
    }

    return amount;
  }

  /**
   * @brief
   *  Set or skip the next step whether or not the topping is requested
   * 
   * @param skipStep 
   *  Next step if the topping is not requested
   * 
   * @param applyStep 
   *  Next step if the topping is requested
   * 
   * @param flavour 
   *  Requested flavour
   */
  private checkSkipFlavour(skipStep: APPLY_STATE_MACHINE, applyStep: APPLY_STATE_MACHINE, flavour: FlavourList){
    let nextStep: APPLY_STATE_MACHINE = this.isToppingReq(flavour) ? applyStep : skipStep;

    this.triggerFSM( STATE_MACHINES.FSM_APPLY, nextStep, true ); 
  }

  /**
   * @brief
   *  Validate flavours and set next topping state machine step
   * 
   * @param params 
   *  Event data
   */
  private validateFlavours(params: any){    
    // Check whether toppings are required
    if( this.flavousNumber == 0 ){
      
      if(params.id == EVENTS.EV_STATE_MACHINE){
        this.infoLog("[INFO-LOG]: No toppings selected, moving muffins (Both motors)");

        this.moveMotors( MOTORS.MOTOR_ALL, MOTOR_DIR.MOTOR_D_FORWARD );
        this.setExclusiveEv(EVENTS.EV_INPUTS);
      }
      else if( params.inputs[ PLC_IO.PLC_IN_TRANS_SENSOR ] && !this.FSM.sensPosTriggerWaiting ){
        this.FSM.sensPosTrigger ++;
        this.FSM.sensPosTriggerWaiting = true;

        if(this.FSM.sensPosTrigger >= 2){
          this.infoLog("[INFO-LOG]: Both muffins are out of the toasting area, toast motor is now OFF");

          this.FSM.sensPosTrigger = 0;
          this.FSM.sensPosTriggerWaiting = false;

          this.stopMotors(MOTORS.MOTOR_TOAST);
          this.triggerFSM( STATE_MACHINES.FSM_TOPPING, TOPPING_STATE_MACHINE.TOPPING_SM__FINISHING , true );
        }
      }
      else if( !params.inputs[ PLC_IO.PLC_IN_TRANS_SENSOR ] && this.FSM.sensPosTriggerWaiting ){
        this.infoLog("[INFO-LOG]: First muffin is out of the toasting area, waiting for the last one");

        this.FSM.sensPosTriggerWaiting = false;
        this.FSM.ignoreReadySens = false;
      }
    }
    else{
      this.infoLog("[INFO-LOG]: Moving first muffin to the topping area (Both motors)");

      this.moveMotors( MOTORS.MOTOR_ALL, MOTOR_DIR.MOTOR_D_FORWARD );
      this.triggerFSM( STATE_MACHINES.FSM_TOPPING, TOPPING_STATE_MACHINE.TOPPING_SM__APPLY_TOPPING , true );
    }
  }

  /**
   * @brief
   *  Move last slice to the sensor position
   * 
   * @param params
   *  Event parameters
   */
  private moveLastSlice(params: any){
    if(params.id == EVENTS.EV_STATE_MACHINE){
      this.infoLog("[INFO-LOG]: Moving last muffin to the measure area (Both motors)");

      this.moveMotors( MOTORS.MOTOR_ALL, MOTOR_DIR.MOTOR_D_FORWARD );      
      this.startAuxTimer(true);

      let self = this;

      self.setExclusiveEv(EVENTS.EV_INPUTS);
    }
    else{
      this.measureSlice(params, APPLY_STATE_MACHINE.APPLY_SM__WAITING_T1_B, SLICES.SLICE_B, true);
    }
  }

  /**
   * @brief
   *  Finish topping
   * 
   * @param params 
   *  Event data
   */
  private finishTopping(params: any){
    if(params.id == EVENTS.EV_STATE_MACHINE && this.FSM.readySensTrigger.counter < 2){
      if( this.FSM.readySensTrigger.counter == 0 ){
        this.infoLog("[INFO-LOG]: Waiting for both muffins to exit the topping area");
      }
      else{
        this.infoLog("[INFO-LOG]: Waiting for last muffin to exit the topping area");
      }

      this.setExclusiveEv(EVENTS.EV_INPUTS);
    }
    else if(this.FSM.readySensTrigger.counter >= 2){
      this.infoLog("[INFO-LOG]: Both muffins are now out of the topping area. Both motors are now OFF");

      this.FSM.readySensTrigger.counter = 0;
      this.FSM.ignoreReadySens = true;
      this.stopMotors(MOTORS.MOTOR_ALL);
      this.FSM.topping = TOPPING_STATE_MACHINE.TOPPING_SM__FINISHED;

      this.triggerFSM( STATE_MACHINES.FSM_MAIN, MAIN_STATE_MACHINE.MAIN_SM__FINISHING , true );
    }
  }

  /**
   * @brief
   *  Check if the topping is requested
   * 
   * @param flavour 
   *  Topping to check
   * 
   * @return
   *  true -> topping requested
   *  false -> toping not requested
   */
  private isToppingReq(flavour: FlavourList){
    for (let index = 0 ; index < this.tomObject.slice[SLICES.SLICE_A].flavour.maxFlavours ; index++) {      
      if(this.tomObject.slice[SLICES.SLICE_A].flavour.flavours[index].id == flavour){
        return true;
      }
    }

    return false;
  }

  /**
   * @brief
   *  Measure slide
   * 
   * @param params 
   *  Eventa data
   * 
   * @param nextStep 
   *  Next step of the state machine
   * 
   * @param slice 
   *  Slice to measure
   * 
   * @param updateMuffinA
   *  True -> Update mufin A position
   *  False -> Do not update muffin A position
   */
  private measureSlice(params: any, nextStep: any, slice: SLICES, updateMuffinA: boolean = false){
    if( params.id == EVENTS.EV_STATE_MACHINE ){
      this.setExclusiveEv(EVENTS.EV_INPUTS);
    }
    else if(params.id != EVENTS.EV_INPUTS){
      return;
    }
    else if( params.inputs[ PLC_IO.PLC_IN_TRANS_SENSOR ] && !this.FSM.sensPosTriggerWaiting ){
      this.startTimer(true);

      this.infoLog("[INFO-LOG]: Measuring muffin, motor 1 is now stopped");

      this.FSM.sensPosTriggerWaiting = true;
      this.stopMotors(MOTORS.MOTOR_TOAST);      
    }
    else if( !params.inputs[ PLC_IO.PLC_IN_TRANS_SENSOR ] && this.FSM.sensPosTriggerWaiting ){
      this.setExclusiveEv(EVENTS.EV_STATE_MACHINE);

      this.FSM.sensPosTriggerWaiting = false;
      this.stopMotors(MOTORS.MOTOR_TOPPING);
      this.startTimer(false);  

      this.FSM.compute.updateSliceData(this.jCounter.count, slice, this.logs[ SYS_LOGS.LOG_FSM_INFO ] );

      this.FSM.compute.sliceSet[slice] = true;

      // Update slice A saved position
      if(updateMuffinA){
        this.startAuxTimer(false);
        this.FSM.compute.slicePos[SLICES.SLICE_A] += this.FSM.compute.computeDistance(this.jAuxCounter.count);

        this.infoLog("[INFO-LOG]: First muffin position updated to " + String(this.FSM.compute.slicePos[SLICES.SLICE_A]) + 
                     "mm, elapsed " + String(this.jAuxCounter.count) + "ms");
      }

      let self = this;

      // Set next step after some time in order to let the topping motor to stop
      $(function() {
        setTimeout(function() {
          self.triggerFSM( STATE_MACHINES.FSM_APPLY, nextStep, true );
        }, 1000);
      })
    }
  }

  //*** General state machine utils ***/

  /**
   * @brief
   *  Execute a state machine event and set the next step
   * 
   * @param stateMachine 
   *  State machine
   * 
   * @param nextStep 
   *  Next step of the selected @var{stateMachine} event
   * 
   * @param ignoreOther 
   *  True -> Ignore all other events.
   *  False -> Leave other events status as they are.
   * 
   * @param evContent 
   *  Event content
   */
  private triggerFSM(stateMachine: STATE_MACHINES, nextStep: any, ignoreOther = false, evContent: any = null){

    switch(stateMachine){
      case STATE_MACHINES.FSM_MAIN:
        this.FSM.main = nextStep;
        break;

      case STATE_MACHINES.FSM_TOASTING:
        this.FSM.toasting = nextStep;
        break;

      case STATE_MACHINES.FSM_TOPPING:
        this.FSM.topping = nextStep;
        break;

      case STATE_MACHINES.FSM_APPLY:
        this.FSM.applying = nextStep;
        break;
    }

    if(ignoreOther){
      this.setExclusiveEv(EVENTS.EV_STATE_MACHINE);
    }
    else{
      this.setWaitingEv( 
        [ 
          { status: EV_WAIT_SET.EV_WAIT_FOR_EVENT, id: EVENTS.EV_STATE_MACHINE },
        ]
      );
    }

    this.dispatcher.trigger(this.FSM.events.checkStateMachine, evContent);
  }

  /**
   * @brief
   *  Update the database values
   */
  private updateDb(){
    let flavourCount: number = 0;
    let sale: toppingSale = new toppingSale;

    sale.topping1 = false;
    sale.topping2 = false;
    sale.topping3 = false;
    sale.topping4 = false;
    sale.noTopping = false;
    sale.toast = this.tomObject.slice[SLICES.SLICE_A].toasted.id;

    // Check slices
    for (let sliceIndex = 0 ; sliceIndex < SLICES.SLICES_MAX ; sliceIndex++) {
      // Check flavours
      for (let flavourIndex = 0 ; flavourIndex < this.tomObject.slice[sliceIndex].flavour.maxFlavours ; flavourIndex++) {
        // Check selected
        if(this.tomObject.slice[sliceIndex].flavour.flavours[flavourIndex].id != FlavourList.Flavour_NA){
          // Update topping amount
          this.tomObject.toppingLevels[flavourIndex] -= this.tomObject.toppingPortion;
          // Update topping flavours amount
          this.tomService.updateToppingAmount(flavourIndex, this.tomObject.toppingLevels[flavourIndex]);

          flavourCount ++; // Increment flavour number
          this.tomService.updateTom(this.tomObject); // Notify new TOM object values
          
          switch(flavourIndex){
            case FlavourList.Flavour_0:
              sale.topping1 = true;
              this.infoLog("[INFO-LOG]: Topping 1 sold, current amount: " + String( this.tomObject.toppingLevels[flavourIndex] ) + "oz" );
              break;

            case FlavourList.Flavour_1:
              this.infoLog("[INFO-LOG]: Topping 2 sold, current amount: " + String( this.tomObject.toppingLevels[flavourIndex] ) + "oz" );
              sale.topping2 = true;
              break;

            case FlavourList.Flavour_2:
              this.infoLog("[INFO-LOG]: Topping 3 sold, current amount: " + String( this.tomObject.toppingLevels[flavourIndex] ) + "oz" );
              sale.topping3 = true;
              break;

            case FlavourList.Flavour_3:
              this.infoLog("[INFO-LOG]: Topping 4 sold, current amount: " + String( this.tomObject.toppingLevels[flavourIndex] ) + "oz" );
              sale.topping4 = true;
              break;
          }
          
        }
      }        
    }

    if(flavourCount == 0){
      sale.noTopping = true;
    }

    this.tomService.insertSale(sale);
  }

  /**
   * @brief
   *  Prints information logs
   * 
   * @param printCont 
   *  Data to print
   */
  private infoLog(printCont: any){
    if( this.logs[ SYS_LOGS.LOG_FSM_INFO ] ){
      console.log(printCont);
    }
  }

  private processViewHandler(){
    let self = this;
    setTimeout(function(){
      self.screenStep.insert=true;
      self.screenStep.process=false;
      console.log("switch step");
    },5000);
   
  }

}
