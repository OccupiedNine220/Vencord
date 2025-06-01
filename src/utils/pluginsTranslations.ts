/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addTranslations } from "./i18n";

// Переводы для плагинов
export const pluginsTranslations = {
    // Плагин translate
    "Translate": "Перевод",
    "Translate messages with Google Translate or DeepL": "Переводите сообщения с помощью Google Translate или DeepL",
    "Language that received messages should be translated from": "Язык, с которого следует переводить полученные сообщения",
    "Language that received messages should be translated to": "Язык, на который следует переводить полученные сообщения",
    "Language that your own messages should be translated from": "Язык, с которого следует переводить ваши собственные сообщения",
    "Language that your own messages should be translated to": "Язык, на который следует переводить ваши собственные сообщения",
    "Show translate button in chat bar": "Показывать кнопку перевода в чате",
    "Translation service": "Сервис перевода",
    "Translation service (Not supported on Web!)": "Сервис перевода (Не поддерживается в веб-версии!)",
    "Google Translate": "Google Переводчик",
    "DeepL Free": "DeepL Бесплатный",
    "DeepL Pro": "DeepL Pro",
    "DeepL API key": "API ключ DeepL",
    "Get your API key from": "Получите свой API ключ с",
    "Automatically translate your messages before sending": "Автоматически переводить ваши сообщения перед отправкой",
    "You can also shift/right click the translate button to toggle this": "Вы также можете нажать Shift/правую кнопку мыши на кнопке перевода, чтобы переключить это",
    "Show a tooltip on the ChatBar button whenever a message is automatically translated": "Показывать подсказку на кнопке чата при автоматическом переводе сообщения",
    "Detect language": "Определить язык",

    // Плагин showHiddenChannels
    "Show Hidden Channels": "Показать скрытые каналы",
    "Shows channels that you don't have access to view": "Показывает каналы, к которым у вас нет доступа",
    "Hidden Channels": "Скрытые каналы",
    "Visible to everyone": "Видимы всем",
    "You can't access this channel.": "Вы не можете получить доступ к этому каналу.",

    // Плагин messageLogger
    "Message Logger": "Журнал сообщений",
    "Logs deleted and edited messages": "Сохраняет удаленные и отредактированные сообщения",
    "Deleted Message": "Удаленное сообщение",
    "Edited Message": "Отредактированное сообщение",
    "Original Message": "Исходное сообщение",
    "Clear Log": "Очистить журнал",
    "Open Logs": "Открыть журнал",
    "Enable Logging": "Включить журналирование",
    "Ghost Pings": "Призрачные упоминания",
    "Log deleted messages": "Сохранять удаленные сообщения",
    "Log edited messages": "Сохранять отредактированные сообщения",
    "Show notification for ghost pings": "Показывать уведомления о призрачных упоминаниях",
    "Show notification for edited messages": "Показывать уведомления об отредактированных сообщениях",
    "Show notification for deleted messages": "Показывать уведомления об удаленных сообщениях",
    "Ignore bots": "Игнорировать ботов",
    "Ignore own messages": "Игнорировать собственные сообщения",
    "Ignore blocked users": "Игнорировать заблокированных пользователей",

    // Плагин spotifyControls
    "Spotify Controls": "Управление Spotify",
    "Adds a Spotify player in Discord": "Добавляет плеер Spotify в Discord",
    "Play": "Воспроизвести",
    "Pause": "Пауза",
    "Next": "Следующий",
    "Previous": "Предыдущий",
    "Shuffle": "Перемешать",
    "Repeat": "Повторять",
    "Connect to Spotify": "Подключиться к Spotify",
    "Show controls in the chat bar": "Показывать элементы управления в чате",
    "Show controls in the user panel": "Показывать элементы управления в панели пользователя",
    "Hide when nothing is playing": "Скрывать, когда ничего не воспроизводится",
    "Show album cover": "Показывать обложку альбома",

    // Плагин vcDoubleClick
    "Double Click to Edit": "Двойной клик для редактирования",
    "Allows you to double click a message to edit it": "Позволяет редактировать сообщение двойным кликом",

    // Плагин noReplyMention
    "No Reply Mention": "Без упоминания при ответе",
    "Disables the automatic mention when replying to someone": "Отключает автоматическое упоминание при ответе кому-либо",
    "Default to mention off": "По умолчанию без упоминания",
    "Default to mention on": "По умолчанию с упоминанием",
    "Always mention off": "Всегда без упоминания",
    "Always mention on": "Всегда с упоминанием",
};

// Добавляем переводы в систему локализации
export function initPluginsTranslations() {
    addTranslations("ru", pluginsTranslations);
}

export default initPluginsTranslations; 