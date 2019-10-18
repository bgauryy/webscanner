const scanner = require('../../src/index.js');

describe('API testing', function () {
    test('should check scanner basic api', () => {
        expect(typeof scanner.getSession === 'function').toBeTruthy();
    });
});
