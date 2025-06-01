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

import { definePluginSettings, Settings } from "@api/Settings";
import { getUserSettingLazy } from "@api/UserSettings";
import { ErrorCard } from "@components/ErrorCard";
import { Flex } from "@components/Flex";
import { Link } from "@components/Link";
import { Devs } from "@utils/constants";
import { isTruthy } from "@utils/guards";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { useAwaiter } from "@utils/react";
import definePlugin, { OptionType } from "@utils/types";
import { findByCodeLazy, findComponentByCodeLazy } from "@webpack";
import { ApplicationAssetUtils, Button, FluxDispatcher, Forms, React, UserStore } from "@webpack/common";

const useProfileThemeStyle = findByCodeLazy("profileThemeStyle:", "--profile-gradient-primary-color");
const ActivityView = findComponentByCodeLazy(".party?(0", ".card");

const ShowCurrentGame = getUserSettingLazy<boolean>("status", "showCurrentGame")!;

async function getApplicationAsset(key: string): Promise<string> {
    return (await ApplicationAssetUtils.fetchAssetIds(settings.store.appID!, [key]))[0];
}

interface ActivityAssets {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
}

interface Activity {
    state?: string;
    details?: string;
    timestamps?: {
        start?: number;
        end?: number;
    };
    assets?: ActivityAssets;
    buttons?: Array<string>;
    name: string;
    application_id: string;
    metadata?: {
        button_urls?: Array<string>;
    };
    type: ActivityType;
    url?: string;
    flags: number;
}

const enum ActivityType {
    PLAYING = 0,
    STREAMING = 1,
    LISTENING = 2,
    WATCHING = 3,
    COMPETING = 5
}

const enum TimestampMode {
    NONE,
    NOW,
    TIME,
    CUSTOM,
}

const settings = definePluginSettings({
    appID: {
        type: OptionType.STRING,
        description: "ID приложения (обязательное поле)",
        onChange: onChange,
        isValid: (value: string) => {
            if (!value) return "Требуется ID приложения.";
            if (value && !/^\d+$/.test(value)) return "ID приложения должен быть числом.";
            return true;
        }
    },
    appName: {
        type: OptionType.STRING,
        description: "Имя приложения (обязательное поле)",
        onChange: onChange,
        isValid: (value: string) => {
            if (!value) return "Требуется имя приложения.";
            if (value.length > 128) return "Имя приложения должно быть не длиннее 128 символов.";
            return true;
        }
    },
    details: {
        type: OptionType.STRING,
        description: "Детали (первая строка)",
        onChange: onChange,
        isValid: (value: string) => {
            if (value && value.length > 128) return "Детали (первая строка) должны быть не длиннее 128 символов.";
            return true;
        }
    },
    state: {
        type: OptionType.STRING,
        description: "Состояние (вторая строка)",
        onChange: onChange,
        isValid: (value: string) => {
            if (value && value.length > 128) return "Состояние (вторая строка) должно быть не длиннее 128 символов.";
            return true;
        }
    },
    type: {
        type: OptionType.SELECT,
        description: "Тип активности",
        onChange: onChange,
        options: [
            {
                label: "Играю",
                value: ActivityType.PLAYING,
                default: true
            },
            {
                label: "Стримлю",
                value: ActivityType.STREAMING
            },
            {
                label: "Слушает",
                value: ActivityType.LISTENING
            },
            {
                label: "Смотрит",
                value: ActivityType.WATCHING
            },
            {
                label: "Соревнуется",
                value: ActivityType.COMPETING
            }
        ]
    },
    streamLink: {
        type: OptionType.STRING,
        description: "Ссылка на Twitch.tv или Youtube.com (только для типа активности Стримлю)",
        onChange: onChange,
        disabled: isStreamLinkDisabled,
        isValid: isStreamLinkValid
    },
    timestampMode: {
        type: OptionType.SELECT,
        description: "Режим временной метки",
        onChange: onChange,
        options: [
            {
                label: "None",
                value: TimestampMode.NONE,
                default: true
            },
            {
                label: "Since discord open",
                value: TimestampMode.NOW
            },
            {
                label: "Same as your current time (not reset after 24h)",
                value: TimestampMode.TIME
            },
            {
                label: "Custom",
                value: TimestampMode.CUSTOM
            }
        ]
    },
    startTime: {
        type: OptionType.NUMBER,
        description: "Временная метка в миллисекундах (только для режима временной метки)",
        onChange: onChange,
        disabled: isTimestampDisabled,
        isValid: (value: number) => {
            if (value && value < 0) return "Временная метка должна быть больше 0.";
            return true;
        }
    },
    endTime: {
        type: OptionType.NUMBER,
        description: "Временная метка в миллисекундах (только для режима временной метки)",
        onChange: onChange,
        disabled: isTimestampDisabled,
        isValid: (value: number) => {
            if (value && value < 0) return "Временная метка должна быть больше 0.";
            return true;
        }
    },
    imageBig: {
        type: OptionType.STRING,
        description: "Большая картинка (ключ/ссылка)",
        onChange: onChange,
        isValid: isImageKeyValid
    },
    imageBigTooltip: {
        type: OptionType.STRING,
        description: "Подсказка большой картинки",
        onChange: onChange,
        isValid: (value: string) => {
            if (value && value.length > 128) return "Подсказка большой картинки должна быть не длиннее 128 символов.";
            return true;
        }
    },
    imageSmall: {
        type: OptionType.STRING,
        description: "Маленькая картинка (ключ/ссылка)",
        onChange: onChange,
        isValid: isImageKeyValid
    },
    imageSmallTooltip: {
        type: OptionType.STRING,
        description: "Подсказка маленькой картинки",
        onChange: onChange,
        isValid: (value: string) => {
            if (value && value.length > 128) return "Подсказка маленькой картинки должна быть не длиннее 128 символов.";
            return true;
        }
    },
    buttonOneText: {
        type: OptionType.STRING,
        description: "Текст кнопки 1",
        onChange: onChange,
        isValid: (value: string) => {
            if (value && value.length > 31) return "Button 1 text must be not longer than 31 characters.";
            return true;
        }
    },
    buttonOneURL: {
        type: OptionType.STRING,
        description: "Ссылка на кнопку 1",
        onChange: onChange
    },
    buttonTwoText: {
        type: OptionType.STRING,
        description: "Текст кнопки 2",
        onChange: onChange,
        isValid: (value: string) => {
            if (value && value.length > 31) return "Текст кнопки 2 должен быть не длиннее 31 символов.";
            return true;
        }
    },
    buttonTwoURL: {
        type: OptionType.STRING,
        description: "Ссылка на кнопку 2",
        onChange: onChange
    }
});

function onChange() {
    setRpc(true);
    if (Settings.plugins.CustomRPC.enabled) setRpc();
}

function isStreamLinkDisabled() {
    return settings.store.type !== ActivityType.STREAMING;
}

function isStreamLinkValid(value: string) {
    if (!isStreamLinkDisabled() && !/https?:\/\/(www\.)?(twitch\.tv|youtube\.com)\/\w+/.test(value)) return "Ссылка на стрим должна быть валидной URL.";
    if (value && value.length > 512) return "Ссылка на стрим должна быть не длиннее 512 символов.";
    return true;
}

function isTimestampDisabled() {
    return settings.store.timestampMode !== TimestampMode.CUSTOM;
}

function isImageKeyValid(value: string) {
    if (/https?:\/\/(cdn|media)\.discordapp\.(com|net)\//.test(value)) return "Не используйте ссылку на Discord. Используйте ссылку на изображение Imgur вместо этого.";
    if (/https?:\/\/(?!i\.)?imgur\.com\//.test(value)) return "Ссылка на Imgur должна быть прямой ссылкой на изображение (например, https://i.imgur.com/...). Нажмите правой кнопкой мыши на изображение и выберите 'Копировать адрес изображения'";
    if (/https?:\/\/(?!media\.)?tenor\.com\//.test(value)) return "Ссылка на Tenor должна быть прямой ссылкой на изображение (например, https://media.tenor.com/...). Нажмите правой кнопкой мыши на GIF и выберите 'Копировать адрес изображения'";
    return true;
}

async function createActivity(): Promise<Activity | undefined> {
    const {
        appID,
        appName,
        details,
        state,
        type,
        streamLink,
        startTime,
        endTime,
        imageBig,
        imageBigTooltip,
        imageSmall,
        imageSmallTooltip,
        buttonOneText,
        buttonOneURL,
        buttonTwoText,
        buttonTwoURL
    } = settings.store;

    if (!appName) return;

    const activity: Activity = {
        application_id: appID || "0",
        name: appName,
        state,
        details,
        type,
        flags: 1 << 0,
    };

    if (type === ActivityType.STREAMING) activity.url = streamLink;

    switch (settings.store.timestampMode) {
        case TimestampMode.NOW:
            activity.timestamps = {
                start: Date.now()
            };
            break;
        case TimestampMode.TIME:
            activity.timestamps = {
                start: Date.now() - (new Date().getHours() * 3600 + new Date().getMinutes() * 60 + new Date().getSeconds()) * 1000
            };
            break;
        case TimestampMode.CUSTOM:
            if (startTime || endTime) {
                activity.timestamps = {};
                if (startTime) activity.timestamps.start = startTime;
                if (endTime) activity.timestamps.end = endTime;
            }
            break;
        case TimestampMode.NONE:
        default:
            break;
    }

    if (buttonOneText) {
        activity.buttons = [
            buttonOneText,
            buttonTwoText
        ].filter(isTruthy);

        activity.metadata = {
            button_urls: [
                buttonOneURL,
                buttonTwoURL
            ].filter(isTruthy)
        };
    }

    if (imageBig) {
        activity.assets = {
            large_image: await getApplicationAsset(imageBig),
            large_text: imageBigTooltip || undefined
        };
    }

    if (imageSmall) {
        activity.assets = {
            ...activity.assets,
            small_image: await getApplicationAsset(imageSmall),
            small_text: imageSmallTooltip || undefined
        };
    }


    for (const k in activity) {
        if (k === "type") continue;
        const v = activity[k];
        if (!v || v.length === 0)
            delete activity[k];
    }

    return activity;
}

async function setRpc(disable?: boolean) {
    const activity: Activity | undefined = await createActivity();

    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity: !disable ? activity : null,
        socketId: "CustomRPC",
    });
}

export default definePlugin({
    name: "CustomRPC",
    description: "Добавьте полностью настраиваемый Rich Presence (статус игры) в ваш профиль Discord",
    authors: [Devs.captain, Devs.AutumnVN, Devs.nin0dev],
    dependencies: ["UserSettingsAPI"],
    start: setRpc,
    stop: () => setRpc(true),
    settings,

    patches: [
        {
            find: ".party?(0",
            all: true,
            replacement: {
                match: /\i\.id===\i\.id\?null:/,
                replace: ""
            }
        }
    ],

    settingsAboutComponent: () => {
        const activity = useAwaiter(createActivity);
        const gameActivityEnabled = ShowCurrentGame.useSetting();
        const { profileThemeStyle } = useProfileThemeStyle({});

        return (
            <>
                {!gameActivityEnabled && (
                    <ErrorCard
                        className={classes(Margins.top16, Margins.bottom16)}
                        style={{ padding: "1em" }}
                    >
                        <Forms.FormTitle>Notice</Forms.FormTitle>
                        <Forms.FormText>Activity Sharing isn't enabled, people won't be able to see your custom rich presence!</Forms.FormText>

                        <Button
                            color={Button.Colors.TRANSPARENT}
                            className={Margins.top8}
                            onClick={() => ShowCurrentGame.updateSetting(true)}
                        >
                            Enable
                        </Button>
                    </ErrorCard>
                )}

                <Flex flexDirection="column" style={{ gap: ".5em" }} className={Margins.top16}>
                    <Forms.FormText>
                        Go to the <Link href="https://discord.com/developers/applications">Discord Developer Portal</Link> to create an application and
                        get the application ID.
                    </Forms.FormText>
                    <Forms.FormText>
                        Upload images in the Rich Presence tab to get the image keys.
                    </Forms.FormText>
                    <Forms.FormText>
                        If you want to use an image link, download your image and reupload the image to <Link href="https://imgur.com">Imgur</Link> and get the image link by right-clicking the image and selecting "Copy image address".
                    </Forms.FormText>
                    <Forms.FormText>
                        You can't see your own buttons on your profile, but everyone else can see it fine.
                    </Forms.FormText>
                    <Forms.FormText>
                        Some weird unicode text ("fonts" 𝖑𝖎𝖐𝖊 𝖙𝖍𝖎𝖘) may cause the rich presence to not show up, try using normal letters instead.
                    </Forms.FormText>
                </Flex>

                <Forms.FormDivider className={Margins.top8} />

                <div style={{ width: "284px", ...profileThemeStyle, marginTop: 8, borderRadius: 8, background: "var(--bg-mod-faint)" }}>
                    {activity[0] && <ActivityView
                        activity={activity[0]}
                        user={UserStore.getCurrentUser()}
                        currentUser={UserStore.getCurrentUser()}
                    />}
                </div>
            </>
        );
    }
});
