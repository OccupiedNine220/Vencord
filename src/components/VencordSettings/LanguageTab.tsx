/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSettings } from "@api/Settings";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { getLocale, setLocale, t, VencordLocale } from "@utils/i18n";
import { Forms, Select, useState } from "@webpack/common";

import ErrorBoundary from "../ErrorBoundary";

export default ErrorBoundary.wrap(function LanguageTab() {
    const [locale, setCurrentLocale] = useState<VencordLocale>(getLocale());

    // Список доступных языков
    const languages = [
        { label: "English (US)", value: "en-US" },
        { label: "Русский", value: "ru" }
    ];

    // Обработчик изменения языка
    function handleLanguageChange(value: string) {
        const newLocale = value as VencordLocale;
        setLocale(newLocale);
        setCurrentLocale(newLocale);
        // Перезагрузка страницы для применения изменений
        setTimeout(() => {
            location.reload();
        }, 500);
    }

    return (
        <div>
            <Forms.FormTitle tag="h2">{t("VENCORD_LANGUAGE")}</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom8}>
                {t("LANGUAGE_SETTINGS_DESC")}
            </Forms.FormText>

            <Forms.FormSection>
                <Forms.FormTitle>{t("LANGUAGE_SELECTION")}</Forms.FormTitle>
                <Select
                    options={languages}
                    isSelected={o => o.value === locale}
                    select={o => handleLanguageChange(o.value)}
                    serialize={o => o.value}
                    closeOnSelect={true}
                    className={Margins.bottom16}
                />
                <Forms.FormText className={Margins.bottom8}>
                    {t("LANGUAGE_RESTART_DESC")}
                </Forms.FormText>
            </Forms.FormSection>

            <Forms.FormDivider className={classes(Margins.top16, Margins.bottom16)} />

            <Forms.FormSection>
                <Forms.FormTitle>{t("LANGUAGE_CONTRIBUTION")}</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom8}>
                    {t("LANGUAGE_CONTRIBUTION_DESC")}
                </Forms.FormText>
            </Forms.FormSection>
        </div>
    );
}); 