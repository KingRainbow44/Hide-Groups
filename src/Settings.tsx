import React from "react";

import { util } from "replugged";
import { Checkbox, Flex, Text, TextInput } from "replugged/components";

import { config } from "./index";

import "./Settings.css";

export function Settings(): React.ReactElement {
    return (
        <Flex className={"HideGroups_Settings"}>
            <Flex className={"HideGroups_Setting"}>
                <Text.Normal>Ignored DMs</Text.Normal>
                <TextInput className={"HideGroups_Input"} {...util.useSetting(config, "ignored", "")} />
            </Flex>

            <Flex className={"HideGroups_Setting"}>
                <Text.Normal>Reveal on new message</Text.Normal>
                <Checkbox {...util.useSetting(config, "showOnMessage", true)} />
            </Flex>
        </Flex>
    );
}
