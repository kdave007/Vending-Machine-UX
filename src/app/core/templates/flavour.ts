import {Contents, TextLang} from './language';

/**
 * @brief
 *  Flavour list
 */
export enum FlavourList {
    Flavour_NA = -1,
    Flavour_0,
    Flavour_1,
    Flavour_2,
    Flavour_3,

    Flavour_max, ///< Maximum number of flavours
}

/**
 * @brief
 *  Portion list
 */
export enum PortionList {
    Portion_Small = 0, ///< Small portion
    Portion_Med,       ///< Medium portion
    Portion_Big,       ///< Big portion
}

/**
 * @brief
 *  Flavour amount modes
 */
export enum FlavourAmountModes {
    FMode_Time = 0, ///< Extruction time mode
    FMode_Rep       ///< Repeat extruction mode      
}


/**
 * @brief
 *  Flavour contents
 */
export class Flavour {
    name: TextLang[] = []; ///< Short name
    description: TextLang[] = []; ///< Description
    preview: string; ///< Image url
    info: FlavourInfo = new FlavourInfo; ///< Main information
}

/**
 * @brief
 *  Flavour information
 */
export class FlavourInfo {
    id: FlavourList = FlavourList.Flavour_NA; ///< Flavour id 
    small_time: number;  ///< Small portion total time
    med_time: number;    ///< Medium portion total time
    big_time: number;    ///< Big portion total time
    price: number;       ///< Topping price
}

/**
 * @brief
 *  Flavour amount information
 */
export class FlavourAmount {
    name: Contents = new Contents; ///< Short name
    description: Contents = new Contents; ///< Description    
    info: FlavourAmountInfo = new FlavourAmountInfo; ///< Main information
}

/**
 * @brief
 *  Flavour amount information
 */
export class FlavourAmountInfo {
    id: PortionList = PortionList.Portion_Small; ///< Flavour id 
    timeRep: number; ///< Flavour time in seconds or repeat times, according to @param{mode}
}