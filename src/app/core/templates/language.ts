/**
 * @brief
 *  Language list
 */
export enum Language {
    Lan_EN = 0,
    Lan_ES = 1
}

/**
 * @brief
 *  Language contents
 */
export class Languages {
    lang: Language;
    img: string;
}

/**
 * @brief
 *  Local class as a wrapper to language text
 */
export class Contents {
    // Contents according to language
    en: string; // English
    es: string; // Spanish
}

/**
 * @brief
 *  Interface texts structure
 */
export class TextLang {
    lang: Language;
    txt: string;
}