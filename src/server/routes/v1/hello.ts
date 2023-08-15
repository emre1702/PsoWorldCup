import { defineEventHandler, getRequestHeaders } from 'h3';

export default defineEventHandler((ctx) => {
    console.log(getRequestHeaders(ctx));
    return "test";
});
