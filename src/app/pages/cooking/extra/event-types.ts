import { MOTOR_DIR, MOTORS, MOTOR_DIR_TIMEOUT, EV_WAIT_SET } from './utils';
import { PLC_IO, PWM_CHANNELS } from '../../../core/templates/main';

/**
 * @brief
 *  Event list
 */
export enum EVENTS{
  EV_MOTOR,
  EV_INPUTS,
  EV_STATE_MACHINE,
  EV_GPIO_OUT,
  EV_PWM,

  EV_MAX, ///< Maximum events number
}

/**
 * @brief
 *  Timeout motor event type
 * 
 * @note 
 *  For description see @class{CookingEvents} @var{timeoutMotor}
 */
export type timeoutMotorEvent = {
  timeout: MOTOR_DIR_TIMEOUT, 
  motor: MOTORS, 
  dir: MOTOR_DIR,

  id: EVENTS, ///< Identifier
}

/**
 * @brief
 *  New imputs notification event type
 * 
 * @note
 *  For desription see @class{CookingEvents} @var{inputs}
 */
export type inputsEvent = {
  inputs: boolean[],

  id: EVENTS, ///< Identifier
}

/**
 * @brief
 *  State machine event type
 * 
 * @note
 *  For desription see @class{CookingEvents} @var{inputs}
 */
export type stateMachineEvent = {
  contents: any,

  id:EVENTS,
}

/**
 * @brief
 *  GPIO out event type
 */
export type timerGpioEvent = {
  gpio: PLC_IO,

  id:EVENTS,
}

/**
 * @brief
 *  PWM timeout event
 */
export type pwmEvent = {
  channel: PWM_CHANNELS,

  id:EVENTS,
}

/**
 * @brief
 *  Used to set the event wait or not status
 */
export type EV_ST = {
  status: EV_WAIT_SET; ///< Event request status
  id: EVENTS; ///< Event id
}
