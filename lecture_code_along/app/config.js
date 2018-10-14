/*
Create and export config variables based on NODE_ENV
*/


// Container for all env
var environment = {};

// Create staging config
environment.staging = {
    'envName': 'staging',
    'httpPort': 3000,
    'httpsPort': 3001
};

// Production config
environment.production = {
    'envName': 'production',
    'httpPort': 5000,
    'httpsPort': 5001
};

// Determine which env should be exported
var currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check specified environment is one of our preset env
var environmentToExport = typeof(environment[currentEnv]) == 'object' ? environment[currentEnv] : environment.staging;

// export envronment only
module.exports = environmentToExport;