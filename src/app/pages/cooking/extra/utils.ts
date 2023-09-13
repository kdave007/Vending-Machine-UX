import { EVENTS } from './event-types';
import { SLICES, TOPPING_PWM_LV } from '../../../core/templates/main'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

/**
 * @brief
 *  System logs list
 */
export enum SYS_LOGS{
  LOG_FSM_MAIN, ///< Main FSM steps log
  LOG_FSM_TOAST, ///< Toasting FSM steps log
  LOG_FSM_TOPPING, ///< Topping FSM steps log
  LOG_FSM_INFO, ///< General FSMs infomation logs 
  
  LOG_MAX, ///< Maximum number of logs
}

/**
 * @brief
 *  Event set value, used in @function{setWaitingEv}
 */
export enum EV_WAIT_SET{
  EV_WAIT_FOR_EVENT, ///< Waiting for event
  EV_IGNORE_EVENT, ///< Ignore event
  EV_DO_NOT_MODIFY ///< Do not modify its status
}

/**
 * @brief
 *  Motors direction
 */
export enum MOTOR_DIR{
  MOTOR_D_FORWARD,
  MOTOR_D_BACKWARDS,

  MOTOR_D_STOP, ///< Used to get GPIOs of motors
}

/**
 * @brief
 *  Motors list
 */
export enum MOTORS{
  MOTOR_TOAST,
  MOTOR_TOPPING,

  MOTOR_MAX, ///< Maximum motors number
  MOTOR_ALL, ///< Reference to all motors
}

/**
 * @bief
 *  Motor GPIOS ON/OFF pin array content
 */
export enum MOTOR_GPIOS_L{
  MOTOR_GPIO_ON, ///< ON gpio
  MOTOR_GPIO_OFF, ///< OFF gpio

  MOTOR_GPIO_STOP_1 = 0, ///< Stop gpio 1
  MOTOR_GPIO_STOP_2, ///< Stop gpio 2
}

/**
 * @brief
 *  Motor direction timeout type
 */
export enum MOTOR_DIR_TIMEOUT{
  MOTOR_DT_NO_TIMEOUT, ///< No timeout when switching motor direction
  MOTOR_DT_STOP, ///< Stop motor when timeout is reached
  MOTOR_DT_TOGGLE ///< Toggle motor direction when timeout us reached
}

/**
 * @brief
 *  Main state machine
 */
export enum MAIN_STATE_MACHINE{
  MAIN_SM__WAITING, ///< Waiting for start
  MAIN_SM__TOASTING, ///< Toasting process
  MAIN_SM__TOPPING, ///< Applying toppings
  MAIN_SM__FINISHING, ///< Finishing process
  MAIN_SM__FINISHED ///< Process finished
}

/**
 * @brief
 *  Toasting state machine
 */
export enum TOASTING_STATE_MACHINE{
  TOASTING_SM__WAITING_SLICE_A, ///< Waiting for slice A
  TOASTING_SM__WAITING_SLICE_B, ///< Waiting for slice B
  TOASTING_SM__TOASTING, ///< Toasting slices
  TOASTING_SM__FINISHED, ///< Toasting finished
}

/**
 * @brief
 *  Topping state machine
 */
export enum TOPPING_STATE_MACHINE{
  TOPPING_SM__WAITING_START, ///< Waiting for topping start
  TOPPING_SM__APPLY_TOPPING, ///< Applying topping
  TOPPING_SM__FINISHING, ///< Finishing topping process
  TOPPING_SM__FINISHED, ///< Topping process finished
}

/**
 * @brief
 *  Applying topping state machine
 */
export enum APPLY_STATE_MACHINE{
  /*************/
  /** Phase 1 **/
  /*************/

  APPLY_SM__SENS_A, ///< Measuring slice A

  APPLY_SM__WAITING_T1_A, ///< Waiting to start and validate topping 1 at slice A
  APPLY_SM__MOVING_T1_A, ///< Moving slice A to topping 1 position
  APPLY_SM__APPLYING_T1_A, ///< Applying topping 1 at slice A

  APPLY_SM__WAITING_T2_A, ///< Waiting to start and validate topping 2 at slice A
  APPLY_SM__MOVING_T2_A, ///< Moving slice A to topping 2 position
  APPLY_SM__APPLYING_T2_A, ///< Applying topping 2 at slice A


  /*************/
  /** Phase 2 **/
  /*************/
  
  APPLY_SM__SENS_B, ///< Measuring slice B

  APPLY_SM__WAITING_T1_B, ///< Waiting to start and validate topping 1 at slice B
  APPLY_SM__MOVING_T1_B, ///< Moving slice B to topping 1 position
  APPLY_SM__APPLYING_T1_B, ///< Applying topping 1 at slice B

  APPLY_SM__WAITING_T2_B, ///< Waiting to start and validate topping 2 at slice B
  APPLY_SM__MOVING_T2_B, ///< Moving slice B to topping 2 position
  APPLY_SM__APPLYING_T2_B, ///< Applying topping 2 at slice B


  /*************/
  /** Phase 3 **/
  /*************/

  APPLY_SM__WAITING_T3_A, ///< Waiting to start and validate topping 3 at slice A
  APPLY_SM__MOVING_T3_A, ///< Moving slice A to topping 3 position
  APPLY_SM__APPLYING_T3_A, ///< Applying topping 3 at slice A

  APPLY_SM__WAITING_T3_B, ///< Waiting to start and validate topping 3 at slice B
  APPLY_SM__MOVING_T3_B, ///< Moving slice B to topping 3 position
  APPLY_SM__APPLYING_T3_B, ///< Applying topping 3 at slice B

  APPLY_SM__WAITING_T4_A, ///< Waiting to start and validate topping 4 at slice A
  APPLY_SM__MOVING_T4_A, ///< Moving slice A to topping 4 position
  APPLY_SM__APPLYING_T4_A, ///< Applying topping 4 at slice A

  APPLY_SM__WAITING_T4_B, ///< Waiting to start and validate topping 4 at slice B
  APPLY_SM__MOVING_T4_B, ///< Moving slice B to topping 4 position
  APPLY_SM__APPLYING_T4_B, ///< Applying topping 4 at slice B

  APPLY_SM__FINISHED,
}

/**
 * @brief
 *  Phisical checkpoints
 */
export enum CHECKPOINTS{
  CHECKPOINT_SENSOR, //< Transition sensor
  CHECKPOINT_TOPPING_1,
  CHECKPOINT_TOPPING_2,
  CHECKPOINT_TOPPING_3,
  CHECKPOINT_TOPPING_4,  

  MAX_CHECKPOINTS,

  CHECKPOINT_SLICE_A, ///< Used to move according to the slice position
  CHECKPOINT_SLICE_B, ///< Used to move according to the slice position
}

/**
 * State machines list
 */
export enum STATE_MACHINES{
  FSM_MAIN,
  FSM_TOASTING,
  FSM_TOPPING,
  FSM_APPLY,

  FSM_MAX, ///< Maximum number of state machines
}

/**
 * @brief
 *  Contains all the cooking events
 */
export class CookingEvents{
  /**
   * @brief
   *  Motor 1 moving direction timeout is reached
   * 
   * @param timeout @type MOTOR_DIR_TIMEOUT
   *  Timeout type
   * 
   * @param motor @type MOTORS
   *  Motor id
   * 
   * @param dir  @type MOTOR_DIR
   *  Current motor direction
   * 
   * @note
   *  Paramaters use @type{timeoutMotorType} as type
   */
  public timeoutMotor = 'timeoutMotor';

  /**
   * @brief
   *  New inputs notification
   * 
   * @param inputs @type boolean[] @size PLC_IO.PLC_MAX_PINS
   *  Inputs status
   */
  public inputs = 'inputs';

  /**
   * @brief
   *  Check state machine
   * 
   * @param contents @type any 
   *  Any event content with an id if not NULL
   */
  public checkStateMachine = 'stateMachine';

  /**
   * @brief
   *  GPIO out timeout notification
   * 
   * @param gpio @type @enum{PLC_IO}
   *  GPIO out
   */
  public gpioOut = "gpioOut";

  /**
   * @brief
   * PWM timeout notification
   * 
   * @param channel @type @enum{PWM_CHANNELS}
   *  PWM channel
   */
  public pwm = "pwm";
}

/**
 * @brief
 *  Contains distances, speed and compute operations related the muffin transition
 */
export class TomCompute{
  public motorSpeed = 115; ///< Motor speed in mm/s

  public sliceSize: number[] = new Array(SLICES.SLICES_MAX); ///< Slices position
  public slicePos: number[] = new Array(SLICES.SLICES_MAX); ///< Slices position
  public sliceSet: boolean[] = new Array(SLICES.SLICES_MAX); ///< Slices first position

  ///< Toppings distances in mm from sensor
  ///< Left tooping must be a negative value
  public distances: number[] = new Array( CHECKPOINTS.MAX_CHECKPOINTS );
  
  constructor(){
    this.distances[ CHECKPOINTS.CHECKPOINT_SENSOR ] = 0; ///< Must be 0
    this.distances[ CHECKPOINTS.CHECKPOINT_TOPPING_1 ] = 50;
    this.distances[ CHECKPOINTS.CHECKPOINT_TOPPING_2 ] = 160;
    this.distances[ CHECKPOINTS.CHECKPOINT_TOPPING_3 ] = 260;
    this.distances[ CHECKPOINTS.CHECKPOINT_TOPPING_4 ] = 360;
  }

  /**
   * @brief
   *  Update the slice position according to its size
   * 
   * @param elapsedTime 
   *  Elapsed transition time in ms
   * 
   * @param slice 
   *  Slice ID
   * 
   * @param printLog 
   *  True -> Prints log
   *  False -> Log will not be printed
   */
  public updateSliceData(elapsedTime: number, slice: SLICES, printLog: boolean){
    let secTime: number = elapsedTime / 1000; ///< Convert to seconds

    this.sliceSize[ slice ] = this.motorSpeed /* mm/s */ * secTime /* s */; ///< mm
    this.slicePos[ slice ] = this.sliceSize[ slice ] / 2; 

    if(printLog){
      console.log("[INFO-LOG]: Slice[" + String(slice) + "] time: " + String(elapsedTime) + "ms = " + String(secTime) + "s");
      console.log("[INFO-LOG]: Slice[" + String(slice) + "] speed: " + this.motorSpeed + "mm/s");
      console.log("[INFO-LOG]: Slice[" + String(slice) + "] size: " + this.sliceSize[ slice ] + "mm");
      console.log("[INFO-LOG]: Slice[" + String(slice) + "] position: " + this.slicePos[ slice ] + "mm");
    }
  }

  /**
   * @brief
   *  Compute muffin slice distance
   * 
   * @param elapsedTime 
   *  Elapsed time in ms
   */
  public computeDistance(elapsedTime: number){
    let seconds = elapsedTime / 1000;

    return ( seconds * this.motorSpeed /* mm/s */ ) /* mm */;
  }

  /**
   * @brief
   *  Compute muffin slice transition time
   * 
   * @param startCheckpoint 
   *  Origin checkpoint
   * 
   * @param endCheckpoint 
   *  End checkpoint
   * 
   * @param printLog
   *  true -> Prints log
   *  false -> Log will not be printed
   * 
   * @returns
   *  Positive number -> Time in forward movement
   *  Negative number -> Time in backwards movement
   */
  public computeTime(startCheckpoint: CHECKPOINTS, endCheckpoint: CHECKPOINTS, printLog: boolean){
    let startDistance: number;

    if(startCheckpoint == CHECKPOINTS.CHECKPOINT_SLICE_A){
      startDistance = this.slicePos[SLICES.SLICE_A];
    }
    else if(startCheckpoint == CHECKPOINTS.CHECKPOINT_SLICE_B){
      startDistance = this.slicePos[SLICES.SLICE_B];
    }
    else{
      startDistance = this.distances[startCheckpoint];
    }

    if(printLog){
      console.log("[INFO-LOG]: Start distance: " + String(startDistance) + "mm");
      console.log("[INFO-LOG]: End distance: " + String( this.distances[endCheckpoint] ) + "mm");
    }

    let distance = this.distances[endCheckpoint] - startDistance; ///< mm
    let transTime = ( ( distance /* mm */ / this.motorSpeed /* mm/s */ ) * 1000 ); //< Compute time and convert seconds to milliseconds

    return transTime;
  }

}

/**
 * @brief
 *  Ready sensor type
 */
export class readySens {
  prevStatus: boolean; ///< Previous status
  counter: number; ///< Slice counter
}

/**
 * @brief
 *  State machine class
 */
export class StateMachine{
  ///< Main state machine
  public main: MAIN_STATE_MACHINE = MAIN_STATE_MACHINE.MAIN_SM__WAITING;

  ///< Toasting state machine
  public toasting: TOASTING_STATE_MACHINE = TOASTING_STATE_MACHINE.TOASTING_SM__WAITING_SLICE_A;

  ///< Topping state machine
  public topping: TOPPING_STATE_MACHINE = TOPPING_STATE_MACHINE.TOPPING_SM__WAITING_START;

  ///< Applying state machine
  public applying: APPLY_STATE_MACHINE = APPLY_STATE_MACHINE.APPLY_SM__SENS_A;

  public compute: TomCompute = new TomCompute; ///< Compute utils

  public events: CookingEvents = new CookingEvents; ///< Events IDs

  public waitingEv: boolean[] = new Array(EVENTS.EV_MAX); ///< true when the state machine is waiting 
                                                          /// for that event, otherwise false

  public toppingTimeout = 3000; ///< Topping timeout in ms                                                   

  public sensPosTrigger: number = 0; ///< Sensor positive trigger counter

  public sensPosTriggerWaiting: boolean = false; ///< True when its waiting for the negative trigger

  public ignoreReadySens: boolean = true; ///< Used to ignore the ready sensor

  public readySensTrigger: readySens = new readySens; ///< Ready sensor trigger counter 

  public repeatedFlavour: boolean = false; ///< Used to repeat the flavour when its the only one selected

  public oneFlavourMode: boolean = false; ///< Used to detect when only one flavour is selected

  /***********************/
  /*** Constant values ***/                                                          
  /***********************/
  
  public movFirstSliceTime: number = 2000; ///< Time in ms to move the first detected slice
  public movSecondSliceTime: number = 3000; ///< Time in ms to move the second detected slice

  public ssrLampInfTime: number = 30000; ///< Time in ms to turn ON the SSR lamp

  public ssrLampSupTimeLow: number = 20000; ///< Time in ms for low toasting
  public ssrLampSupTimeMed: number = 40000; ///< Time in ms for medium toasting
  public ssrLampSupTimeHigh: number = 60000; ///< Time in ms for high toasting

  public toppingClosePwm: number = TOPPING_PWM_LV.TOPPING_LV_CLOSE; ///< Duty cycle to close the topping mechanism
  public toppingOpenPwm: number = TOPPING_PWM_LV.TOPPING_LV_OPEN; ///< Duty cycle to open the topping mechanism

  public extraToppingTime: number = 1000; ///< Extra time after using @var{toppingOpenPwm} in ms

  constructor(){
    this.readySensTrigger.prevStatus = false;
    this.readySensTrigger.counter = 0;
  }
}

/**
 * @brief
 *  Counter type for jQuery counter
 */
export class counter {
  status: boolean; ///< true when started
  interval: number; ///< Counter interval
  count: number; ///< Count storage in ms
  handler: any; ///< jQuery counter handler
}