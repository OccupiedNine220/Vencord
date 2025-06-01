/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Notices } from "@api/index";
import { definePluginSettings } from "@api/Settings";
import { makeRange } from "@components/PluginSettings/components";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { FluxDispatcher } from "@webpack/common";

const settings = definePluginSettings({
    idleTimeout: {
        description: "Минуты до того как Discord перейдет в режим ожидания (0 чтобы отключить режим ожидания)",
        type: OptionType.SLIDER,
        markers: makeRange(0, 60, 5),
        default: 10,
        stickToMarkers: false,
        restartNeeded: true // Because of the setInterval patch
    },
    remainInIdle: {
        description: "Когда вы вернетесь в Discord, оставайтесь в режиме ожидания до того как вы подтвердите что хотите выйти из АФК",
        type: OptionType.BOOLEAN,
        default: true
    }
});

export default definePlugin({
    name: "CustomIdle",
    description: "Позволяет вам установить время до того как Discord перейдет в режим ожидания (или отключить режим ожидания)",
    authors: [Devs.newwares],
    settings,
    patches: [
        {
            find: 'type:"IDLE",idle:',
            replacement: [
                {
                    match: /(?<=Date\.now\(\)-\i>)\i\.\i\|\|/,
                    replace: "$self.getIdleTimeout()||"
                },
                {
                    match: /Math\.min\((\i\.\i\.getSetting\(\)\*\i\.\i\.\i\.SECOND),\i\.\i\)/,
                    replace: "$1" // Decouple idle from afk (phone notifications will remain at user setting or 10 min maximum)
                },
                {
                    match: /\i\.\i\.dispatch\({type:"IDLE",idle:!1}\)/,
                    replace: "$self.handleOnline()"
                }
            ]
        }
    ],

    handleOnline() {
        if (!settings.store.remainInIdle) {
            FluxDispatcher.dispatch({
                type: "IDLE",
                idle: false
            });
            return;
        }

        const backOnlineMessage = "С возращением! Нажмите кнопку чтоб выйти из АФК. Нажмите на X, чтобы оставаться в режиме ожидания до перезагрузки.";
        if (
            Notices.currentNotice?.[1] === backOnlineMessage ||
            Notices.noticesQueue.some(([, noticeMessage]) => noticeMessage === backOnlineMessage)
        ) return;

        Notices.showNotice(backOnlineMessage, "Выйти из АФК", () => {
            Notices.popNotice();
            FluxDispatcher.dispatch({
                type: "IDLE",
                idle: false
            });
        });
    },

    getIdleTimeout() { // milliseconds, default is 6e5
        const { idleTimeout } = settings.store;
        return idleTimeout === 0 ? Infinity : idleTimeout * 60000;
    }
});
