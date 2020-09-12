# time-fast-forward

![npm](https://img.shields.io/npm/v/time-fast-forward)
![GitHub](https://img.shields.io/github/license/ZitRos/time-fast-forward)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/ZitRos/time-fast-forward/NPM%20package)

Fake the system time (Date, hrtime) in your tests, without freezing it (unlike in many other libraries).

## Installation

```bash
npm install --save-dev time-fast-forward
```

## Examples

```ts
import { jumpToTime, shiftTimeBy, resetTime } from 'time-fast-forward';

console.log(new Date());                    // -> Sat Sep 12 2020 01:18:21

// Add one hour to the current clock
shiftTimeBy(60 * 60 * 1000);
console.log(new Date());                      // -> Sat Sep 12 2020 02:18:21

// Shift -2 hours from now (-1 hour from the original time in this example)
shiftTimeBy(-2 * 60 * 60 * 1000);
console.log(new Date());                      // -> Sat Sep 12 2020 00:18:21

// Jump to a given date and time. Mind when providing anything relative here
jumpToTime("Fri, 11 Sep 2022 22:26:43 GMT");  // jumpToTime(2020, 1, 3), etc
console.log(new Date());                      // -> Fri Sep 11 2022 22:26:43

resetTime();                                  // Get back to the normal time
console.log(new Date());                      // -> Sat Sep 12 2020 01:18:21
```

This library can also potentially support time freezing, PRs for this are welcome:

```ts
console.log(new Date());                      // -> Sat Sep 12 2020 01:18:21
                                              //         note seconds here ^
setTimeout(() => {
  console.log(new Date());                    // -> Sat Sep 12 2020 01:18:22
                                              //     time is still ticking ^
  
  // Not implemented yet: PRs are welcome!
  freezeTime();

  setTimeout(() => {
    console.log(new Date());                  // -> Sat Sep 12 2020 01:18:22
                                              //        now time is frozen ^

    // Not implemented yet: PRs are welcome!
    unfreezeTime();
    console.log(new Date());                  // -> Sat Sep 12 2020 01:18:22
                                              // now at +1s from real time ^

    resetTime();
    console.log(new Date());                  // -> Sat Sep 12 2020 01:18:21
                                              // back to the normal time!  ^
  }, 1000);
}, 1000);
```

## License

[MIT](LICENSE) © [Nikita Savchenko](https://nikita.tk)
