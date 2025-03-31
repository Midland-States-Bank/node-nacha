const getAccountType = require('./getAccountType');

describe('getAccountType', () => {
  it("returns 'C' for '2' (Checking)", () => {
    expect(getAccountType('2')).toBe('C');
    expect(getAccountType('27')).toBe('C');
    expect(getAccountType('22')).toBe('C');
  });

  it("returns 'S' for '3' (Savings)", () => {
    expect(getAccountType('3')).toBe('S');
    expect(getAccountType('37')).toBe('S');
    expect(getAccountType('32')).toBe('S');
  });

  it("returns 'G' for '4' (General Ledger)", () => {
    expect(getAccountType('4')).toBe('G');
    expect(getAccountType('47')).toBe('G');
    expect(getAccountType('42')).toBe('G');
  });

  it("returns 'L' for '5' (Loan)", () => {
    expect(getAccountType('5')).toBe('L');
    expect(getAccountType('57')).toBe('L');
    expect(getAccountType('52')).toBe('L');
  });

  it("defaults to 'C' for unknown codes", () => {
    expect(getAccountType('7')).toBe('C');
    expect(getAccountType('')).toBe('C');
    expect(getAccountType(null)).toBe('C');
    expect(getAccountType(undefined)).toBe('C');
  });
});