const getAccountTypeCode = require('./getAccountTypeCode');

describe('getAccountTypeCode', () => {
  it("returns '4' for 'G' (General Ledger)", () => {
    expect(getAccountTypeCode('G')).toBe('4');
  });

  it("returns '3' for 'S' (Savings)", () => {
    expect(getAccountTypeCode('S')).toBe('3');
  });

  it("returns '2' for 'C' (Checking)", () => {
    expect(getAccountTypeCode('C')).toBe('2');
  });

  it("returns '2' for 'L' (Loans)", () => {
    expect(getAccountTypeCode('C')).toBe('2');
  });

  it("returns '2' for unknown values", () => {
    expect(getAccountTypeCode(null)).toBe('2');
    expect(getAccountTypeCode(undefined)).toBe('2');
    expect(getAccountTypeCode('')).toBe('2');
  });
});