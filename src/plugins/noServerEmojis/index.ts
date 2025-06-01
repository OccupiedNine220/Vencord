/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    shownEmojis: {
        description: "Типы эмодзи, которые будут отображаться в меню автозаполнения.",
        type: OptionType.SELECT,
        default: "onlyUnicode",
        options: [
            { label: "Только юникодные эмодзи", value: "onlyUnicode" },
            { label: "Юникодные эмодзи и эмодзи сервера, на котором вы находитесь", value: "currentServer" },
            { label: "Юникодные эмодзи и все эмодзи сервера (по умолчанию)", value: "all" }
        ]
    }
});

export default definePlugin({
    name: "NoServerEmojis",
    authors: [Devs.UlyssesZhan],
    description: "Не показывать эмодзи сервера в меню автозаполнения.",
    settings,
    patches: [
        {
            find: "}searchWithoutFetchingLatest(",
            replacement: {
                match: /\.get\((\i)\)\.nameMatchesChain\(\i\)\.reduce\(\((\i),(\i)\)=>\{/,
                replace: "$& if ($self.shouldSkip($1, $3)) return $2;"
            }
        }
    ],
    shouldSkip(guildId: string, emoji: any) {
        if (emoji.type !== 1) {
            return false;
        }
        if (settings.store.shownEmojis === "onlyUnicode") {
            return true;
        }
        if (settings.store.shownEmojis === "currentServer") {
            return emoji.guildId !== guildId;
        }
        return false;
    }
});
