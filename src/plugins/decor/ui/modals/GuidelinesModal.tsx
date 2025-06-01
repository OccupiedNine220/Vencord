/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Link } from "@components/Link";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { Button, Forms, Text } from "@webpack/common";

import { settings } from "../../settings";
import { cl, DecorationModalStyles, requireAvatarDecorationModal } from "../";
import { openCreateDecorationModal } from "./CreateDecorationModal";

function GuidelinesModal(props: ModalProps) {
    return <ModalRoot
        {...props}
        size={ModalSize.SMALL}
        className={DecorationModalStyles.modal}
    >
        <ModalHeader separator={false} className={cl("modal-header")}>
            <Text
                color="header-primary"
                variant="heading-lg/semibold"
                tag="h1"
                style={{ flexGrow: 1 }}
            >
                Подождите
            </Text>
            <ModalCloseButton onClick={props.onClose} />
        </ModalHeader>
        <ModalContent
            scrollbarType="none"
        >
            <Forms.FormText>
                Отправляя урашение, вы соглашаетесь с <Link
                    href="https://github.com/decor-discord/.github/blob/main/GUIDELINES.md"
                >
                    правилами
                </Link>. Не прочитав эти правила, ваш аккаунт может быть заблокирован от создания большего количества урашений в будущем.
            </Forms.FormText>
        </ModalContent>
        <ModalFooter className={cl("modal-footer")}>
            <Button
                onClick={() => {
                    settings.store.agreedToGuidelines = true;
                    props.onClose();
                    openCreateDecorationModal();
                }}
            >
                Продолжить
            </Button>
            <Button
                onClick={props.onClose}
                color={Button.Colors.PRIMARY}
                look={Button.Looks.LINK}
            >
                Назад
            </Button>
        </ModalFooter>
    </ModalRoot>;
}

export const openGuidelinesModal = () =>
    requireAvatarDecorationModal().then(() => openModal(props => <GuidelinesModal {...props} />));
