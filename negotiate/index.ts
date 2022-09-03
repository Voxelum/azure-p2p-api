import { authorized, defineHttp } from "../lib/utils";

export default defineHttp(authorized((context, req, connectionInfo) => {
    return { body: connectionInfo }
}));
