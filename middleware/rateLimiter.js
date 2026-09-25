const rateLimit = require("express-rate-limit");



// if (requests < max) {
// next();          // express-rate-limit does this internally
// }
// else {
//  handler(req, res);   // your code runs
// }

const urlGenerationLimiter = rateLimit({

    windowMs: 10 * 60 * 1000,

    max: 5,

    handler: (req, res) => {

        return res.status(429).render("home", {

            message:
                "You have reached the URL creation limit. Please wait 10 minutes before creating more links."

        });

    }


});

module.exports = urlGenerationLimiter;