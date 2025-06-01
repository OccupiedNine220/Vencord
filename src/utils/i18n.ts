/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { i18n as discordI18n } from "@webpack/common";
import { findByPropsLazy } from "@webpack";
import { Settings } from "../api/Settings";

export type VencordLocale = "en-US" | "ru";

// Fallback locale
const DEFAULT_LOCALE: VencordLocale = "en-US";

// Текущая локаль
let currentLocale: VencordLocale = DEFAULT_LOCALE;

// Получаем модуль локали Discord
const discordLocaleModule = findByPropsLazy("getLocale");

// Загруженные переводы
const translations: Record<VencordLocale, Record<string, string>> = {
    "en-US": {},
    "ru": {}
};

// Инициализация русских переводов
translations["ru"] = {
    // Общие строки
    "VENCORD_SETTINGS": "Настройки Vencord",
    "VENCORD_PLUGINS": "Плагины Vencord",
    "VENCORD_THEMES": "Темы Vencord",
    "VENCORD_CLOUD": "Облако Vencord",
    "VENCORD_UPDATER": "Обновление Vencord",
    "VENCORD_LANGUAGE": "Язык Vencord",

    // Настройки
    "SETTINGS_SAVED": "Настройки сохранены",
    "SETTINGS_RESET": "Настройки сброшены",
    "SETTINGS_CLOUD_SYNC": "Синхронизация настроек в облаке",
    "SETTINGS_CLOUD_SYNC_DESC": "Синхронизируйте ваши настройки между устройствами",

    // Плагины
    "PLUGINS_INSTALLED": "Установленные плагины",
    "PLUGINS_ENABLED": "Включено",
    "PLUGINS_DISABLED": "Отключено",
    "PLUGINS_SEARCH": "Поиск плагинов...",
    "PLUGINS_SETTINGS": "Настройки плагина",

    // Обновления
    "UPDATE_AVAILABLE": "Доступно обновление!",
    "UPDATE_COMPLETE": "Обновление завершено!",
    "UPDATE_RESTART": "Нажмите здесь, чтобы перезапустить",
    "UPDATE_CHECK": "Проверить обновления",
    "UPDATE_CHECKING": "Проверка обновлений...",
    "UPDATE_DOWNLOADING": "Загрузка обновления...",
    "UPDATE_ERROR": "Ошибка обновления",

    // Языковые настройки
    "LANGUAGE_SETTINGS_DESC": "Выберите язык интерфейса Vencord. Изменения вступят в силу после перезагрузки.",
    "LANGUAGE_SELECTION": "Выбор языка",
    "LANGUAGE_RESTART_DESC": "Для применения изменений требуется перезагрузка страницы.",
    "LANGUAGE_CONTRIBUTION": "Помощь с переводом",
    "LANGUAGE_CONTRIBUTION_DESC": "Вы можете помочь с переводом Vencord на другие языки. Посетите наш GitHub репозиторий для получения дополнительной информации."
};

/**
 * Устанавливает текущую локаль
 * @param locale Локаль для установки
 */
export function setLocale(locale: VencordLocale) {
    currentLocale = locale;
}

/**
 * Получает текущую локаль
 * @returns Текущая локаль
 */
export function getLocale(): VencordLocale {
    return currentLocale;
}

/**
 * Переводит строку на текущий язык
 * @param key Ключ перевода
 * @param defaultValue Значение по умолчанию, если перевод не найден
 * @returns Переведенная строка
 */
export function translate(key: string, defaultValue?: string): string {
    // Если перевод существует для текущей локали, используем его
    if (translations[currentLocale]?.[key]) {
        return translations[currentLocale][key];
    }

    // Если перевод существует для локали по умолчанию, используем его
    if (translations[DEFAULT_LOCALE]?.[key]) {
        return translations[DEFAULT_LOCALE][key];
    }

    // Возвращаем значение по умолчанию или ключ
    return defaultValue ?? key;
}

/**
 * Сокращенная функция для перевода
 */
export const t = translate;

/**
 * Добавляет новые переводы
 * @param locale Локаль для добавления переводов
 * @param newTranslations Объект с переводами
 */
export function addTranslations(locale: VencordLocale, newTranslations: Record<string, string>) {
    translations[locale] = {
        ...translations[locale],
        ...newTranslations
    };
}

/**
 * Инициализирует систему локализации
 */
export function initLocalization() {
    // Пытаемся определить локаль из настроек Discord
    try {
        const discordLocale = discordLocaleModule?.getLocale();
        if (discordLocale === "ru") {
            setLocale("ru");
        }
    } catch (e) {
        console.error("Failed to get Discord locale", e);
    }

    // В будущем можно добавить настройку для выбора языка независимо от Discord
}

// Экспортируем всё для использования в других модулях
export const i18n = {
    translate,
    t,
    setLocale,
    getLocale,
    addTranslations,
    initLocalization
};

export default i18n; 