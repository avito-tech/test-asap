function html(htmlText) {
    return function(ctx) {
        let res = ctx.proxyToClientResponse;

        res.setHeader('Content-Type', 'text/html');
        res.end(htmlText);
    };
}

module.exports = {
    html
};
