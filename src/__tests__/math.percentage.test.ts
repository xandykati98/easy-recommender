import { WhatIsXPercentOfY, XisWhatPercentOfY, PercentageIncreaseFromXtoY } from '../math/percentage';

test('[math] Percentage', () => {
    expect(WhatIsXPercentOfY(50,10)).toBe(5);
    expect(XisWhatPercentOfY(50,10)).toBe(500);
    expect(PercentageIncreaseFromXtoY(10,50)).toBe(400);
});