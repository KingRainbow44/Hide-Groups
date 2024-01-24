import { Injector, Logger, settings, common } from "replugged";
import { ContextMenuTypes } from "replugged/types";
import { MenuGroupContext } from "./ContextMenu";
const { fluxDispatcher: Dispatcher } = common;

interface Settings {
    ignored: string;
    showOnMessage: boolean;
}

const inject = new Injector();
const logger = Logger.plugin("Hide-Groups");

let list: HTMLElement | null = null;
const elements: { [key: string]: HTMLElement } = {};

const mutationObserver = new MutationObserver(onChange);
export const config = await settings.init<Settings>("hide-groups");
const ignored = () => config.get("ignored", "");

const removeIgnored = (event: any) => {
    if (!config.get("showOnMessage", false)) return;

    const { channelId, guildId } = event;
    if (guildId != undefined || channelId == undefined) return;

    // Check if the channel ID is ignored.
    if (!contains(ignored(), channelId)) return;

    // Remove the channel from the ignored list.
    const newList = ignored()
        .replaceAll(channelId, "")
        .trim()
        .replaceAll(",,", ",")
        .trim();
    config.set("ignored", newList);

    // Append the channel to the list.
    list?.appendChild(elements[channelId]);
    delete elements[channelId];
};

/**
 * Checks if a comma separated list contains a value.
 *
 * @param list The list to check.
 * @param value The value to find.
 */
function contains(list: string, value: string): boolean {
    return list
        .split(",")
        .map((x) => x.trim())
        .includes(value);
}

/**
 * Invoked when the document changes.
 */
function onChange(): void {
    // Check if the 'Direct Messages' panel is visible.
    const dms = findElement("Direct Messages");
    if (dms.length < 2) return;

    list = dms[1];

    // Traverse and determine the channel IDs of each element.
    for (const element of list.children) {
        const first = element.children[0];
        if (first == null) continue;

        const anchor = first.children[0];
        if (!anchor) continue;

        const { href } = anchor as HTMLAnchorElement;
        const split = href.split("/");

        if (split.length != 6) continue;
        const channelId = split[split.length - 1];
        elements[channelId] = element as HTMLElement;
    }

    // Hide elements.
    for (const key in elements) {
        if (!contains(ignored(), key)) continue;

        const element = elements[key];
        element.style.display = "none";
    }
}

/**
 * Finds an element with the specified 'aria-label'.
 *
 * @param label The label to search for.
 */
function findElement(label: string): HTMLElement[] {
    const found: HTMLElement[] = [];
    const elements = document.querySelectorAll("[aria-label]");
    for (const element of elements) {
        if (element.getAttribute("aria-label") === label) {
            found.push(element as HTMLElement);
        }
    }
    return found;
}

export function start(): void {
    logger.log("Listening for DOM changes...");

    inject.utils.addMenuItem<{ channel: { id: string } }>(
        ContextMenuTypes.GdmContext,
        ({ channel: { id } }) => {
            return MenuGroupContext({
                userId: id
            });
        }
    );

    Dispatcher.subscribe("MESSAGE_CREATE", removeIgnored);

    mutationObserver.observe(document, { childList: true, subtree: true });
}

export function stop(): void {
    inject.uninjectAll();

    Dispatcher.unsubscribe("MESSAGE_CREATE", removeIgnored);

    mutationObserver.disconnect();
}

export { Settings } from "./Settings";
