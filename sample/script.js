const length = 1e7;
let c = 0;
const s = performance.now();

function foo() {
    for (let i = 0; i < length; i++) {
        c += i;
    }
}

foo();
console.log(performance.now() - s);
console.log(c);
