/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CopyIcon, DeleteIcon } from "@components/Icons";
import { copyToClipboard } from "@utils/clipboard";
import { Alerts, ContextMenuApi, Menu, UserStore } from "@webpack/common";

import { Decoration } from "../../lib/api";
import { useCurrentUserDecorationsStore } from "../../lib/stores/CurrentUserDecorationsStore";
import { cl } from "../";

export default function DecorationContextMenu({ decoration }: { decoration: Decoration; }) {
    const { delete: deleteDecoration } = useCurrentUserDecorationsStore();

    return <Menu.Menu
        navId={cl("decoration-context-menu")}
        onClose={ContextMenuApi.closeContextMenu}
        aria-label="Опции урашения"
    >
        <Menu.MenuItem
            id={cl("decoration-context-menu-copy-hash")}
            label="Скопировать хэш урашения"
            icon={CopyIcon}
            action={() => copyToClipboard(decoration.hash)}
        />
        {decoration.authorId === UserStore.getCurrentUser().id &&
            <Menu.MenuItem
                id={cl("decoration-context-menu-delete")}
                label="Удалить урашение"
                color="danger"
                icon={DeleteIcon}
                action={() => Alerts.show({
                    title: "Удалить урашение",
                    body: `Вы уверены, что хотите удалить ${decoration.alt}?`,
                    confirmText: "Удалить",
                    confirmColor: cl("danger-btn"),
                    cancelText: "Отмена",
                    onConfirm() {
                        deleteDecoration(decoration);
                    }
                })}
            />
        }
    </Menu.Menu>;
}
