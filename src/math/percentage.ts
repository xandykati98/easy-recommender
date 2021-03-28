/**
 * @description You need to divide the result by 100 if you want a percentage between 1 and 0 instead of 100 and 0
 * @see https://getcalc.com/formula/math/x-percentage-y.png
 */
export const WhatIsXPercentOfY = (x: number, y: number) => (x / 100) * y;
export const XisWhatPercentOfY = (x: number, y: number) => (x / y) * 100;
/**
 * @see https://uploads-cdn.omnicalculator.com/images/percentage_increase_eq2.png
 */
export const PercentageIncreaseFromXtoY = (x: number, y: number) => {
   const res = ((y - x) / x) * 100;
   return isNaN(res) ? 0 : res;
}