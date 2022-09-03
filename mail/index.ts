import { authorized, defineHttp, signalRMessage } from "../lib/utils";

export default defineHttp(authorized((context, req) => {
    if (!req.headers['destination-user'] && !req.headers['destination-group']) {
        return {
            status: 400,
            body: 'Require destination-user or destination-group in headers!'
        }
    }
    if (!req.headers.target) {
        return {
            status: 400,
            body: 'Require target in headers!'
        }
    }
    const body = req.body!
    context.bindings.signalRMessage = signalRMessage({
        userId: req.headers.destination,
        target: req.headers.target,
        arguments: [req.headers.user, body],
    })
    return {
        status: 200,
    }
}));
