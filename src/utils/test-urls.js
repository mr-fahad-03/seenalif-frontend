// Test script for URL generation
import { generateShopURL, createSlug } from './urlUtils.js';

// Test cases
const testCases = [
  {
    input: { parentCategory: 'All In One' },
    expected: '/product-category/all-in-one'
  },
  {
    input: { parentCategory: 'All In One', subcategory: 'Desktop All In One' },
    expected: '/product-category/all-in-one/desktop-all-in-one'
  },
  {
    input: { parentCategory: 'Laptops', brand: 'HP' },
    expected: '/product-category/laptops?brand=HP'
  },
  {
    input: { parentCategory: 'Accessories', subcategory: 'Keyboards', search: 'wireless' },
    expected: '/product-category/accessories/keyboards?search=wireless'
  },
  {
    input: { parentCategory: 'all' },
    expected: '/product-category'
  }
];

console.log('Testing URL generation...');

testCases.forEach((testCase, index) => {
  const result = generateShopURL(testCase.input);
  const passed = result === testCase.expected;
  
  console.log(`Test ${index + 1}: ${passed ? 'PASS' : 'FAIL'}`);
  console.log(`  Input:`, testCase.input);
  console.log(`  Expected: ${testCase.expected}`);
  console.log(`  Got: ${result}`);
  console.log('');
});

// Test slug creation
console.log('Testing slug creation...');
const slugTests = [
  { input: 'All In One', expected: 'all-in-one' },
  { input: 'Desktop All In One', expected: 'desktop-all-in-one' },
  { input: 'Laptops & Notebooks', expected: 'laptops-notebooks' },
  { input: 'Accessories & Components', expected: 'accessories-components' }
];

slugTests.forEach((test, index) => {
  const result = createSlug(test.input);
  const passed = result === test.expected;
  
  console.log(`Slug Test ${index + 1}: ${passed ? 'PASS' : 'FAIL'}`);
  console.log(`  Input: "${test.input}"`);
  console.log(`  Expected: "${test.expected}"`);
  console.log(`  Got: "${result}"`);
  console.log('');
});