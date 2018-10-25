import getParameterByName from '../utils';

describe('Testing utils.js', () => {
  test('recover url parameters correctly', () => {
    const url = 'http://localhost:8080?param1=value1&param2=value2';
    expect(getParameterByName('param1', url)).toBe('value1');
    expect(getParameterByName('param2', url)).toBe('value2');
    expect(getParameterByName('param3', url)).toBe(null);
    expect(getParameterByName('', url)).toBe(null);
    expect(getParameterByName('')).toBe(null);
    expect(getParameterByName()).toBe(null);
  });
});