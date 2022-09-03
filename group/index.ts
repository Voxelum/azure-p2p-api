import { nanoid } from 'nanoid';
import { authorized, defineHttp, signalRMessage } from "../lib/utils";

export default defineHttp(authorized((context, req) => {
    const action = req.method === 'POST' ? 'add' : req.method === 'DELETE' ? 'remove' : ''
    if (!action) {
        return {
            status: 405,
            body: `Do not support method: ${req.method}`
        }
    }
    const group = req.query.group || nanoid()
    context.bindings.signalRGroupActions = signalRMessage({
        userId: req.headers.user,
        groupName: group,
        action,
    }, {
        groupName: group,
        target: 'new-member',
        arguments: [
            req.headers.user
        ],
    })
    return {
        status: 200,
        body: JSON.stringify({ group }),
        headers: {
            'content-type': 'application/json'
        },
    }
}));
