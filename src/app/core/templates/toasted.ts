import {Contents, TextLang} from './language';

/**
 * @brief
 *  Toasted list
 */
export enum Toasted_List {
    Toasted_NA = -10, ///< Toasted not set

    Toasted_S = 10, ///< Slightly toasted
    Toasted_M, ///< Medium toasted 
    Toasted_H  ///< Totally toasted
}

/**
 * @brief
 *  Toasted contents
 */
export class Toasted {
    name: TextLang[] = []; ///< Short name
    description: TextLang[] = []; ///< Description
    preview: string; ///< Image url
    info: ToastedInfo = new ToastedInfo; ///< Main information
}

/**
 * @brief
 *  Toasting information
 */
export class ToastedInfo{
    id: Toasted_List = Toasted_List.Toasted_S; ///< Toasted id
    time: number; ///< Toasting time in seconds
}