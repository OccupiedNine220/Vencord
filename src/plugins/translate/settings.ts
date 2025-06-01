/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    receivedInput: {
        type: OptionType.STRING,
        description: "Язык, с которого должны переводиться полученные сообщения",
        default: "auto",
        hidden: true
    },
    receivedOutput: {
        type: OptionType.STRING,
        description: "Язык, на который должны переводиться полученные сообщения",
        default: "en",
        hidden: true
    },
    sentInput: {
        type: OptionType.STRING,
        description: "Язык, с которого должны переводиться отправленные сообщения",
        default: "auto",
        hidden: true
    },
    sentOutput: {
        type: OptionType.STRING,
        description: "Язык, на который должны переводиться отправленные сообщения",
        default: "en",
        hidden: true
    },

    showChatBarButton: {
        type: OptionType.BOOLEAN,
        description: "Показывать кнопку перевода в чат-бар",
        default: true
    },
    service: {
        type: OptionType.SELECT,
        description: IS_WEB ? "Сервис перевода (Не поддерживается в Web!)" : "Сервис перевода",
        disabled: () => IS_WEB,
        options: [
            { label: "Google Translate", value: "google", default: true },
            { label: "DeepL Free", value: "deepl" },
            { label: "DeepL Pro", value: "deepl-pro" }
        ] as const,
        onChange: resetLanguageDefaults
    },
    deeplApiKey: {
        type: OptionType.STRING,
        description: "DeepL API ключ",
        default: "",
        placeholder: "Получите свой API ключ по ссылке https://deepl.com/your-account",
        disabled: () => IS_WEB
    },
    autoTranslate: {
        type: OptionType.BOOLEAN,
        description: "Автоматически переводить ваши сообщения перед отправкой. Вы также можете нажать Shift/правой кнопкой мыши на кнопку перевода, чтобы переключить это",
        default: false
    },
    showAutoTranslateTooltip: {
        type: OptionType.BOOLEAN,
        description: "Показывать всплывающую подсказку на кнопке чат-бара, когда сообщение автоматически переведено",
        default: true
    },
}).withPrivateSettings<{
    showAutoTranslateAlert: boolean;
}>();

export function resetLanguageDefaults() {
    if (IS_WEB || settings.store.service === "google") {
        settings.store.receivedInput = "auto";
        settings.store.receivedOutput = "en";
        settings.store.sentInput = "auto";
        settings.store.sentOutput = "en";
    } else {
        settings.store.receivedInput = "";
        settings.store.receivedOutput = "en-us";
        settings.store.sentInput = "";
        settings.store.sentOutput = "en-us";
    }
}
