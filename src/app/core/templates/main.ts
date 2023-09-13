import { Language } from './language';
import { FlavourAmountModes, FlavourInfo, FlavourAmountInfo, FlavourList } from './flavour';
import { ToastedInfo, Toasted_List } from './toasted'; 

/**
 * @brief
 *  Topping PWM duty cycles list
 */
export enum TOPPING_PWM_LV{
    TOPPING_LV_OPEN = 300, ///< Duty cycle to open the topping mechanism
    TOPPING_LV_CLOSE = 1000, ///< Duty cycle to close the topping mechanism
  }

/**
 * @brief
 *  Slices list
 */
export enum SLICES{
    SLICE_A,
    SLICE_B,

    SLICES_MAX, ///< Maximum number of slices
}

/**
 * @brief
 *  PWM channels list
 */
export enum PWM_CHANNELS{
    ///< PWM native channels
    PWM_CH_1 = 1,
    PWM_CH_2,
    PWM_CH_3,
    PWM_CH_4,

    PWM_MAX_CHANNELS = PWM_CH_4,

    ///< PWM topping name mask channels
    PWM_NUTELLA = 1,
    PWM_JELLY,
    PWM_PEANUT_BUTTER,
    PWM_BUTTER,

    ///< PWM topping mask channels
    PWM_TOPPING_1 = 1,
    PWM_TOPPING_2,
    PWM_TOPPING_3,
    PWM_TOPPING_4,
}

/**
 * @brief
 *  PLC commands
 */
export enum PLC_COMMANDS{
    PLC_CMD_OUT = 0x01,
    PLC_CMD_CLIENT = 0x03,
    PLC_CMD_PWM = 0x04,    
}

/**
 * @brief
 *  PLC result codes
 */
export enum PLC_RESULT{
    PLC_OK = 0, ///< No error
    PLC_ERROR, ///< An error occured
    PLC_NA ///< Not yet answered
}

/**
 * @brief
 *  PLC pins (Valid for inputs and outputs)
 */
export enum PLC_IO{

    //*******************/
    //** Primitive IOs **/
    //*******************/

    PLC_PIN_0 = 0,
    PLC_PIN_1,
    PLC_PIN_2,
    PLC_PIN_3,
    PLC_PIN_4,
    PLC_PIN_5,
    PLC_PIN_6,
    PLC_PIN_7,
    // Pin 8 and 9 does not exist
    PLC_PIN_10,
    PLC_PIN_11,
    PLC_PIN_12,
    PLC_PIN_13,
    PLC_PIN_14,
    PLC_PIN_15,
    PLC_PIN_16,
    PLC_PIN_17,

    PLC_MAX_PINS, ///< Total pins


    /*******************/
    /** Outputs alias **/
    /*******************/

    PLC_OUT_SSR_LAMP_SUP = PLC_PIN_10, ///< SSR lamp 
    PLC_OUT_SSR_LAMP_INF = PLC_PIN_11, ///< SSR lamp
    
    PLC_OUT_MOTOR_TOAST_FWD = PLC_PIN_14, ///< Toasting motor forward
    PLC_OUT_MOTOR_TOAST_BCK = PLC_PIN_15, ///< Toasting motor backwards

    PLC_OUT_MOTOR_TOPPING_FWD = PLC_PIN_16, ///< Topping motor forward
    PLC_OUT_MOTOR_TOPPING_BCK = PLC_PIN_17, ///< Topping motor backwards


    /******************/
    /** Inputs alias **/
    /******************/

    PLC_IN_MUFFIN_IN = PLC_PIN_0, ///< Muffin IN sensor
    PLC_IN_TRANS_SENSOR = PLC_PIN_1, ///< Transition sensor
    PLC_IN_MUFFIN_OUT = PLC_PIN_2, ///< Muffin OUT sensor
    PLC_IN_START_HANDLE =PLC_PIN_3, ///< Handle sensor
}

/**
 * @brief
 *  Enumeration for bits operations
 */
export enum BITS_IN_BYTE{
   BIT_0,
   BIT_1,
   BIT_2,
   BIT_3,
   BIT_4,
   BIT_5,
   BIT_6,
   BIT_7,
}

/**
 * @brief
 *  Sales list
 */
export enum SALES_TYPES{
    SALE_FLAVOUR_0,
    SALE_FLAVOUR_1,
    SALE_FLAVOUR_2,
    SALE_FLAVOUR_3,
    SALE_NO_FLAVOUR,
    SALE_TOAST_LV1,
    SALE_TOAST_LV2,
    SALE_TOAST_LV3,

    SALE_MAX_SALES
}

/**
 * @brief
 *  Main class as the global data container
 */
export class TomData {
    public language: Language = Language.Lan_EN; ///< System language

    public inputs: boolean[] = new Array(PLC_IO.PLC_MAX_PINS); ///< Inputs status

    public outputs: boolean[] = new Array(PLC_IO.PLC_MAX_PINS); ///< Outputs status

    public updatedInputs: boolean = false; ///< Notifies when there is a new input value

    public slice: MuffinSlice[] = []; ///< Muffin slices

    public randomValue: string; ///< For debugging purposes

    public toppingLevels: number[] = new Array(FlavourList.Flavour_max); ///> Topping levels

    public toppingSales: number[] = new Array(SALES_TYPES.SALE_MAX_SALES); ///> Topping levels

    public toppingFull: number = 25; ///< Topping full capacity (oz)

    public toppingPortion: number = 0.25; ///< Topping portion (oz)

    constructor() { 
        for (let index = 0 ; index < SLICES.SLICES_MAX ; index++) {
            this.slice[index] = new MuffinSlice;
        }

        for (let index = 0 ; index < FlavourList.Flavour_max ; index++) {
            this.toppingLevels[index] = this.toppingFull;
        }

        for (let index = 0 ; index < SALES_TYPES.SALE_MAX_SALES ; index++) {
            this.toppingSales[index] = 0;
        }
    }
}

/**
 * @brief
 *  Flavour related data
 */
export class TomFlavour {
    public maxFlavours: number = 3; ///< Maximum number of flavours per slice

    public flavourMode: FlavourAmountModes = FlavourAmountModes.FMode_Rep;  ///< Flavour amount mode  

    public flavourAmount: FlavourAmountInfo = new FlavourAmountInfo; ///< Flavour amount (depends on @var{flavorMode}), time used for hardware

    ///< Flavour information (Time for GUI operations)
    public flavours: FlavourInfo[] = [];

    constructor(){
        for (let index = 0; index < this.maxFlavours; index++) {
            this.flavours[index] = new FlavourInfo;
        }
    }
}

/**
 * @brief
 *  Muffin information
 */
export class MuffinSlice {
    flavour: TomFlavour = new TomFlavour;  ///< Flavour related data
    toasted: ToastedInfo = new ToastedInfo; ///< Toasted information
}

/**
 * @brief
 *  Sales log content
 */
export class SalesLog {
    dateTime: any;
    
    topping1: boolean;
    topping2: boolean;
    topping3: boolean;
    topping4: boolean; 
}

/**
 * @brief
 *  Total sales log
 */
export class TotalSales {
    topping1: number;
    topping2: number;
    topping3: number;
    topping4: number;
    noTopping: number;
}

/**
 * @brief
 *  Topping sale structure for DB
 */
export class toppingSale {
    topping1: boolean;
    topping2: boolean;
    topping3: boolean;
    topping4: boolean;
    noTopping: boolean;
    toast: Toasted_List;
}