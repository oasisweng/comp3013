'use strict';
module.exports = {
    app: {
        options: {
            configuration: 'app/phpunit.xml.dist',
            bin: 'phpunit',
            followOutput: true,
            color: true
        }
    }
};
