import { AzureFunction, Context, HttpRequest, HttpResponse, HttpResponseSimple } from "@azure/functions"

export interface HTTPError {
    statusCode?: number
    error: string
    details?: object | Array<any> | null
}

export function httpError(e: HTTPError) { return e }

export async function verifyAndGetUserId(authorization?: string) {
    if (!authorization) {
        throw httpError({ statusCode: 401, error: 'You need to send microsoft accessToken in authorization header to use privilege api!' })
    }
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
            Authorization: authorization,
        }
    })
    if (response.status === 200) {
        const content = await response.json()
        const { id, userPrincipalName } = content as any
        return userPrincipalName as string
    }
    throw httpError({ statusCode: response.status, error: 'Fail to request microsoft graph to verify user!' })
}

export function handleError(e: HTTPError): HttpResponseSimple {
    return {
        statusCode: e.statusCode,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: e.error, details: e.details }),
    }
}


export function authorized(func: HttpFunction): HttpFunction {
    return async (context, req: HttpRequest, ...args) => {
        const id = await verifyAndGetUserId(req.headers.Authorization)
        if (req.headers.user !== id) {
            return { status: 400 }
        } else {
            return await func(context, req, args)
        }
    }
}

export type HttpFunction = (context: Context, req: HttpRequest, ...args: any[]) => Promise<HttpResponseSimple> | HttpResponseSimple

export function defineHttp(func: HttpFunction): HttpFunction {
    return async (context, req, ...args) => {
        try {
            return await func(context, req, ...args)
        } catch (e) {
            return handleError(e)
        }
    }
}

export interface SignalRMessage {
    target: string
    arguments: any[]
    /**
     * only send to user
     */
    userId?: string
    /**
     * Only send to group
     */
    groupName?: string
}

export interface SignalRGroupAction {
    userId: string
    groupName: string
    action: 'add' | 'remove'
}

export function signalRMessage(...msgs: Array<SignalRMessage | SignalRGroupAction>) {
    return msgs
}