/**
 * The window that embeds or opened the widget. When the widget runs in an
 * iframe, that is `window.parent`. When it runs as a popup, `window.parent` is
 * the popup itself, so posting there would only talk to ourselves — the host is
 * `window.opener`.
 */
function getHostWindow(): Window | null {
    if (window.parent !== window) {
        return window.parent
    }
    return window.opener ?? null
}

/**
 * Post a message to the host window, if there is one. Never throws: these
 * messages are reports about work that already happened (a created batch, a
 * sent payment), so a failure to deliver one must not fail the step that did it.
 */
export function postToHost(message: unknown) {
    const host = getHostWindow()
    if (!host) {
        console.warn('No host window to post message to', message)
        return
    }
    try {
        host.postMessage(message, '*')
    } catch (error) {
        console.error('Failed to post message to host window', message, error)
    }
}
