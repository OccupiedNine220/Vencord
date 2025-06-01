/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

export default definePlugin({
    name: "CtrlEnterSend",
    authors: [Devs.UlyssesZhan],
    description: "Используйте Ctrl+Enter для отправки сообщений (настраиваемо)",
    settings: definePluginSettings({
        submitRule: {
            description: "Способ отправки сообщения",
            type: OptionType.SELECT,
            options: [
                {
                    label: "Ctrl+Enter (Enter или Shift+Enter для новой строки) (cmd+enter на macOS)",
                    value: "ctrl+enter"
                },
                {
                    label: "Shift+Enter (Enter для новой строки)",
                    value: "shift+enter"
                },
                {
                    label: "Enter (Shift+Enter для новой строки; Discord default)",
                    value: "enter"
                }
            ],
            default: "ctrl+enter"
        },
        sendMessageInTheMiddleOfACodeBlock: {
            description: "Отправлять ли сообщение в середине блока кода",
            type: OptionType.BOOLEAN,
            default: true,
        }
    }),
    patches: [
        // Только один из двух патчей будет в эффекте; Discord часто обновляется, чтобы переключаться между ними.
        // See: https://discord.com/channels/1015060230222131221/1032770730703716362/1261398512017477673
        {
            find: ".selectPreviousCommandOption(",
            replacement: {
                // FIXME(Bundler change related): Remove old compatiblity once enough time has passed
                match: /(?<=(\i)\.which(?:!==|===)\i\.\i.ENTER(\|\||&&)).{0,100}(\(0,\i\.\i\)\(\i\)).{0,100}(?=(?:\|\||&&)\(\i\.preventDefault)/,
                replace: (_, event, condition, codeblock) => `${condition === "||" ? "!" : ""}$self.shouldSubmit(${event},${codeblock})`
            }
        },
        {
            find: "!this.hasOpenCodeBlock()",
            replacement: {
                match: /!(\i).shiftKey&&!(this.hasOpenCodeBlock\(\))&&\(.{0,100}?\)/,
                replace: "$self.shouldSubmit($1, $2)"
            }
        }
    ],
    shouldSubmit(event: KeyboardEvent, codeblock: boolean): boolean {
        let result = false;
        switch (this.settings.store.submitRule) {
            case "shift+enter":
                result = event.shiftKey;
                break;
            case "ctrl+enter":
                result = navigator.platform.includes("Mac") ? event.metaKey : event.ctrlKey;
                break;
            case "enter":
                result = !event.shiftKey && !event.ctrlKey;
                break;
        }
        if (!this.settings.store.sendMessageInTheMiddleOfACodeBlock) {
            result &&= !codeblock;
        }
        return result;
    }
});
