/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
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

import { showNotification } from "@api/Notifications";
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import { closeAllModals } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import { maybePromptToUpdate } from "@utils/updater";
import { filters, findBulk, proxyLazyWebpack } from "@webpack";
import { DraftType, ExpressionPickerStore, FluxDispatcher, NavigationRouter, SelectedChannelStore } from "@webpack/common";

const CrashHandlerLogger = new Logger("CrashHandler");

const { ModalStack, DraftManager } = proxyLazyWebpack(() => {
    const [ModalStack, DraftManager] = findBulk(
        filters.byProps("pushLazy", "popAll"),
        filters.byProps("clearDraft", "saveDraft"),
    );

    return {
        ModalStack,
        DraftManager
    };
});

const settings = definePluginSettings({
    attemptToPreventCrashes: {
        type: OptionType.BOOLEAN,
        description: "Пытаться предотвратить сбои Discord.",
        default: true
    },
    attemptToNavigateToHome: {
        type: OptionType.BOOLEAN,
        description: "Пытаться перейти на домашнюю страницу при предотвращении сбоев Discord.",
        default: false
    }
});

let hasCrashedOnce = false;
let isRecovering = false;
let shouldAttemptRecover = true;

export default definePlugin({
    name: "CrashHandler",
    description: "Утилита для обработки и возможно восстановления после сбоев без перезапуска",
    authors: [Devs.Nuckyz],
    enabledByDefault: true,

    settings,

    patches: [
        {
            find: "#{intl::ERRORS_UNEXPECTED_CRASH}",
            replacement: {
                match: /this\.setState\((.+?)\)/,
                replace: "$self.handleCrash(this,$1);"
            }
        }
    ],

    handleCrash(_this: any, errorState: any) {
        _this.setState(errorState);

        // Already recovering, prevent error which happens more than once too fast to trigger another recover
        if (isRecovering) return;
        isRecovering = true;

        // 1 ms timeout to avoid react breaking when re-rendering
        setTimeout(() => {
            try {
                // Prevent a crash loop with an error that could not be handled
                if (!shouldAttemptRecover) {
                    try {
                        showNotification({
                            color: "#eed202",
                            title: "Discord упал!",
                            body: "Упс :( Discord упал дважды быстро, не пытаюсь восстановиться.",
                            noPersist: true
                        });
                    } catch { }

                    return;
                }

                shouldAttemptRecover = false;
                // This is enough to avoid a crash loop
                setTimeout(() => shouldAttemptRecover = true, 1000);
            } catch { }

            try {
                if (!hasCrashedOnce) {
                    hasCrashedOnce = true;
                    maybePromptToUpdate("Упс, Discord только что упал... но хорошие новости, есть обновление Vencord, которое может исправить эту проблему! Хотите обновить сейчас?", true);
                }
            } catch { }

            try {
                if (settings.store.attemptToPreventCrashes) {
                    this.handlePreventCrash(_this);
                }
            } catch (err) {
                CrashHandlerLogger.error("Не удалось обработать сбой", err);
            }
        }, 1);
    },

    handlePreventCrash(_this: any) {
        try {
            showNotification({
                color: "#eed202",
                title: "Discord has crashed!",
                body: "Attempting to recover...",
                noPersist: true
            });
        } catch { }

        try {
            const channelId = SelectedChannelStore.getChannelId();

            for (const key in DraftType) {
                if (!Number.isNaN(Number(key))) continue;

                DraftManager.clearDraft(channelId, DraftType[key]);
            }
        } catch (err) {
            CrashHandlerLogger.debug("Не удалось очистить черновики.", err);
        }
        try {
            ExpressionPickerStore.closeExpressionPicker();
        }
        catch (err) {
            CrashHandlerLogger.debug("Не удалось закрыть выражение picker.", err);
        }
        try {
            FluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" });
        } catch (err) {
            CrashHandlerLogger.debug("Не удалось закрыть открытое контекстное меню.", err);
        }
        try {
            ModalStack.popAll();
        } catch (err) {
            CrashHandlerLogger.debug("Не удалось закрыть старые модальные окна.", err);
        }
        try {
            closeAllModals();
        } catch (err) {
            CrashHandlerLogger.debug("Не удалось закрыть все открытые модальные окна.", err);
        }
        try {
            FluxDispatcher.dispatch({ type: "USER_PROFILE_MODAL_CLOSE" });
        } catch (err) {
            CrashHandlerLogger.debug("Не удалось закрыть пользовательское окно.", err);
        }
        try {
            FluxDispatcher.dispatch({ type: "LAYER_POP_ALL" });
        } catch (err) {
            CrashHandlerLogger.debug("Не удалось закрыть все слои.", err);
        }
        try {
            FluxDispatcher.dispatch({
                type: "DEV_TOOLS_SETTINGS_UPDATE",
                settings: { displayTools: false, lastOpenTabId: "analytics" }
            });
        } catch (err) {
            CrashHandlerLogger.debug("Не удалось закрыть DevTools.", err);
        }

        if (settings.store.attemptToNavigateToHome) {
            try {
                NavigationRouter.transitionToGuild("@me");
            } catch (err) {
                CrashHandlerLogger.debug("Не удалось перейти на домашнюю страницу", err);
            }
        }

        // Set isRecovering to false before setting the state to allow us to handle the next crash error correcty, in case it happens
        setImmediate(() => isRecovering = false);

        try {
            _this.setState({ error: null, info: null });
        } catch (err) {
            CrashHandlerLogger.debug("Не удалось обновить компонент обработчика сбоев.", err);
        }
    }
});
