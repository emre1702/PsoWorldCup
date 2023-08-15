export default defineNitroConfig({
    routeRules: {
        '/**': { cors: false, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS', 'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization' } }
    }
  });