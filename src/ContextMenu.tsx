import React from "react";

import { components } from "replugged";
const { ContextMenu: { MenuItem } } = components;

import { config } from "./index";

interface ItemProps {
    userId: string;
}

export function MenuGroupContext(props: ItemProps): React.ReactElement {
    return (
        <MenuItem
            id={`${props.userId}-hide_groups`}
            label={`Hide Group`}
            action={() => {
                const existing = config.get("ignored", "");
                const newIgnored = existing ? `${existing}, ${props.userId}` : props.userId;
                config.set("ignored", newIgnored);
            }}
        />
    );
}
