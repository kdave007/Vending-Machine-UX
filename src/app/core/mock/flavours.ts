/**
 * @brief
 *  Contains all the muffin flavours
 */

import { Flavour, FlavourAmount, FlavourList, PortionList } from '../templates/flavour';
import { Language } from '../templates/language';

/**
 * @note
 *  Modify fioxed values to yout needs
 */
export const FLAVOURS: Flavour[] = [
    { 
        name: [
            {lang: Language.Lan_EN, txt: "Hazelnut spread"},
            {lang: Language.Lan_ES, txt: "Crema de avellanas"}
        ], 
        description:[            
            {lang: Language.Lan_EN, txt: "Description 0"},
            {lang: Language.Lan_ES, txt: "Descripción 0"}
        ]        
        , preview: "assets/images/flavours/nutella.png", 
        info: { id: FlavourList.Flavour_0, small_time: 30, med_time: 30, big_time: 30, price: 1.10 } 
    },

    { 
        name: [
            {lang: Language.Lan_EN, txt: "Peanut butter"},
            {lang: Language.Lan_ES, txt: "Mantequilla de maní"}
        ], 
        description:[            
            {lang: Language.Lan_EN, txt: "Description 1"},
            {lang: Language.Lan_ES, txt: "Descripción 1"}
        ]        
        , preview: "assets/images/flavours/peanut_butter.png", 
        info: { id: FlavourList.Flavour_1, small_time: 30, med_time: 30, big_time: 30, price: 1.70 } 
    },

    { 
        name: [
            {lang: Language.Lan_EN, txt: "Strawberry jam"},
            {lang: Language.Lan_ES, txt: "Mermelada de fresa"}
        ], 
        description:[            
            {lang: Language.Lan_EN, txt: "Description 2"},
            {lang: Language.Lan_ES, txt: "Descripción 2"}
        ]        
        , preview: "assets/images/flavours/strawberry_jam.png", 
        info: { id: FlavourList.Flavour_2, small_time: 30, med_time: 30, big_time: 30, price: 2.00 } 
    },

    { 
        name: [
            {lang: Language.Lan_EN, txt: "Butter"},
            {lang: Language.Lan_ES, txt: "Mantequilla"}
        ], 
        description:[            
            {lang: Language.Lan_EN, txt: "Description 3"},
            {lang: Language.Lan_ES, txt: "Descripción 3"}
        ]        
        , preview: "assets/images/flavours/butter.png", 
        info: { id: FlavourList.Flavour_3, small_time: 30, med_time: 30, big_time: 30, price: 0.50 } 
    },

];


/**
 * @note
 *  Modify fioxed values to yout needs
 */
export const FLAVOURS_AMOUNTS: FlavourAmount[] = [
    { name: { en: "Small portion" , es:"Poca porcion"  }, description: { en:"Small portion" , es: "Poca porcion"  }, info: { id: PortionList.Portion_Small, timeRep:30 } },
    { name: { en: "Medium portion", es:"Media porcion" }, description: { en:"Medium portion", es: "Media porcion" }, info: { id: PortionList.Portion_Med  , timeRep:30 } },
    { name: { en: "Big portion"   , es:"Mucha porcion" }, description: { en:"Big portion"   , es: "Mucha porcion" }, info: { id: PortionList.Portion_Big  , timeRep:30 } },
]

