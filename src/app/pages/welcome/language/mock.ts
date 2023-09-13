/**
 * @brief
 *  Contains all the available texts
 */
import { Translate } from './template';
import { Language } from '../../../core/templates/language';

/**
 * @note
 *  Modify fioxed values to yout needs
 */
export const TRANSLATE: Translate = {
  welcomeMsg: [
    { lang: Language.Lan_EN, txt: "TOUCH TO START" },
    { lang: Language.Lan_ES, txt: "TOCA PARA CONTINUAR" }
  ]
};