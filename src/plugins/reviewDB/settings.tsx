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
import { Button } from "@webpack/common";

import { authorize, getToken } from "./auth";
import { openBlockModal } from "./components/BlockedUserModal";
import { cl } from "./utils";

export const settings = definePluginSettings({
    authorize: {
        type: OptionType.COMPONENT,
        component: () => (
            <Button onClick={() => authorize()}>
                Authorize with ReviewDB
            </Button>
        )
    },
    notifyReviews: {
        type: OptionType.BOOLEAN,
        description: "Уведомлять о новых отзывах при запуске",
        default: true,
    },
    showWarning: {
        type: OptionType.BOOLEAN,
        description: "Отображать предупреждение о вежливости в верхней части списка отзывов",
        default: true,
    },
    hideTimestamps: {
        type: OptionType.BOOLEAN,
        description: "Скрывать временные метки на отзывах",
        default: false,
    },
    hideBlockedUsers: {
        type: OptionType.BOOLEAN,
        description: "Скрывать отзывы от заблокированных пользователей",
        default: true,
    },
    buttons: {
        type: OptionType.COMPONENT,
        component: () => (
            <div className={cl("button-grid")} >
                <Button onClick={openBlockModal}>Manage Blocked Users</Button>

                <Button
                    color={Button.Colors.GREEN}
                    onClick={() => {
                        VencordNative.native.openExternal("https://github.com/sponsors/mantikafasi");
                    }}
                >
                    Support ReviewDB development
                </Button>

                <Button onClick={async () => {
                    let url = "https://reviewdb.mantikafasi.dev";
                    const token = await getToken();
                    if (token)
                        url += "/api/redirect?token=" + encodeURIComponent(token);

                    VencordNative.native.openExternal(url);
                }}>
                    ReviewDB website
                </Button>


                <Button onClick={() => {
                    VencordNative.native.openExternal("https://discord.gg/eWPBSbvznt");
                }}>
                    ReviewDB Support Server
                </Button>
            </div >
        )
    }
}).withPrivateSettings<{
    lastReviewId?: number;
    reviewsDropdownState?: boolean;
}>();
