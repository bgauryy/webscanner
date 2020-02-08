const util = require('../../src/utils.js');

describe('utils.js testing', function () {
    test('should clean object', () => {
        const obj = {
            x: 1,
            y: null,
            z: undefined,
            k: 0,
            j: -1,
            t: '',
            h: false,
            o: {},
            oo: {
                o: {}
            }
        };
        util.cleanObject(obj);
        expect(obj).toEqual({
            x: 1,
            j: -1,
            h: false,
            k: 0,
            oo: {
                o: {}
            }
        });
        util.cleanObject(obj, 1);
        expect(obj).toEqual({
            h: false,
            j: -1,
            k: 0,
            oo: {},
            x: 1
        });
        util.cleanObject(obj, 1);
        expect(obj).toEqual({
            h: false,
            j: -1,
            k: 0,
            x: 1
        });
    });

    /*
        test('should test depth', () => {
            expect(utilsTest.getCleanObject({
                x: 1,
                y: null,
                z: undefined,
                k: 0,
                j: -1,
                t: '',
                h: false,
                o: {},
                oo: {
                    o: {}
                }
            }, 1)).toEqual({
                x: 1,
                j: -1,
                h: false,
                k: 0,
                oo: {
                    o: {}
                }
            });
        });
    */
});
