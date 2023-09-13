/**
 * @brief
 *  Contains all the muffin toasted levels
 */

import { Toasted, Toasted_List } from '../templates/toasted';
import { Language } from '../templates/language';


/**
 * @note
 *  Modify fioxed values to yout needs
 */
export const TOASTED: Toasted[] = [
    { 
        info: { id: Toasted_List.Toasted_S, time: 60 }, 
        name: [
            {lang: Language.Lan_EN, txt: "Light toast"},
            {lang: Language.Lan_ES, txt: "Ligeramente tostado"}
        ],
        description: [
            {lang: Language.Lan_EN, txt: "Description low"},
            {lang: Language.Lan_ES, txt: "Bajo"}
        ],
        preview: "assets/images/toast/toast_low.png"
    },

    { 
        info: { id: Toasted_List.Toasted_M, time: 60 }, 
        name: [
            {lang: Language.Lan_EN, txt: "Medium toast"},
            {lang: Language.Lan_ES, txt: "Medianamente tostado"}
        ],
        description: [
            {lang: Language.Lan_EN, txt: "Description medium"},
            {lang: Language.Lan_ES, txt: "Descripción medio"}
        ],
        preview: "assets/images/toast/toast_med.png"
    },

    { 
        info: { id: Toasted_List.Toasted_H, time: 60 }, 
        name: [
            {lang: Language.Lan_EN, txt: "High toast"},
            {lang: Language.Lan_ES, txt: "Altamente tostado"}
        ],
        description: [
            {lang: Language.Lan_EN, txt: "Description high"},
            {lang: Language.Lan_ES, txt: "Descripción alto"}
        ],
        preview: "assets/images/toast/toast_high.png"
    },
]