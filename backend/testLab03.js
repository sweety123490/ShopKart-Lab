const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=============================================');
  console.log('SHOPKART LAB-03 COMPREHENSIVE TEST SUITE');
  console.log('=============================================');
  let passed = 0;
  let total = 0;

  function test(name, condition) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
    }
  }

  // 1. GET /products
  const allRes = await request({ host: 'localhost', port: 5000, path: '/products', method: 'GET' });
  test('GET /products returns 200', allRes.status === 200);
  test('GET /products returns success: true', allRes.body?.success === true);
  test('GET /products returns products array with count', Array.isArray(allRes.body?.products) && allRes.body?.count > 0);

  const sampleProduct = allRes.body?.products?.[0];
  test('Product has required fields (name, price, category, stock, image)', 
    sampleProduct && sampleProduct.name && sampleProduct.price && sampleProduct.category && sampleProduct.stock !== undefined && sampleProduct.image
  );

  // 2. Search filtering: GET /products?search=keyboard
  const searchRes = await request({ host: 'localhost', port: 5000, path: '/products?search=keyboard', method: 'GET' });
  test('GET /products?search=keyboard returns filtered results', 
    searchRes.status === 200 && searchRes.body?.products?.length > 0 && 
    searchRes.body.products.every(p => p.name.toLowerCase().includes('keyboard'))
  );

  // 3. Category filtering: GET /products?category=Electronics
  const catRes = await request({ host: 'localhost', port: 5000, path: '/products?category=Electronics', method: 'GET' });
  test('GET /products?category=Electronics returns only Electronics', 
    catRes.status === 200 && catRes.body?.products?.length > 0 &&
    catRes.body.products.every(p => p.category.toLowerCase() === 'electronics')
  );

  // 4. Combined search + category
  const combRes = await request({ host: 'localhost', port: 5000, path: '/products?search=keyboard&category=Electronics', method: 'GET' });
  test('GET /products?search=keyboard&category=Electronics returns matching items',
    combRes.status === 200 && combRes.body?.products?.length > 0 &&
    combRes.body.products.every(p => p.name.toLowerCase().includes('keyboard') && p.category.toLowerCase() === 'electronics')
  );

  // 5. Bonus Challenge: Sorting by price
  const sortAsc = await request({ host: 'localhost', port: 5000, path: '/products?sort=price_asc', method: 'GET' });
  const pricesAsc = sortAsc.body?.products?.map(p => p.price) || [];
  const isAsc = pricesAsc.slice(1).every((p, i) => p >= pricesAsc[i]);
  test('Bonus: GET /products?sort=price_asc sorts ascending by price', sortAsc.status === 200 && isAsc);

  const sortDesc = await request({ host: 'localhost', port: 5000, path: '/products?sort=price_desc', method: 'GET' });
  const pricesDesc = sortDesc.body?.products?.map(p => p.price) || [];
  const isDesc = pricesDesc.slice(1).every((p, i) => p <= pricesDesc[i]);
  test('Bonus: GET /products?sort=price_desc sorts descending by price', sortDesc.status === 200 && isDesc);

  // 6. GET /products/:id (Single product)
  const singleId = sampleProduct?._id;
  const singleRes = await request({ host: 'localhost', port: 5000, path: `/products/${singleId}`, method: 'GET' });
  test('GET /products/:id returns 200 with product', singleRes.status === 200 && singleRes.body?.product?._id === singleId);

  // 7. GET /products/:id with invalid ObjectId (400)
  const invalidIdRes = await request({ host: 'localhost', port: 5000, path: '/products/invalid123', method: 'GET' });
  test('GET /products/:id returns 400 for invalid ID', invalidIdRes.status === 400);

  // 8. GET /products/:id with not-found ObjectId (404)
  const notFoundRes = await request({ host: 'localhost', port: 5000, path: '/products/650000000000000000000000', method: 'GET' });
  test('GET /products/:id returns 404 for non-existent product', notFoundRes.status === 404);

  // 9. POST /products missing required fields (400)
  const missingFieldRes = await request(
    { host: 'localhost', port: 5000, path: '/products', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Incomplete Item' }
  );
  test('POST /products returns 400 when required fields missing', missingFieldRes.status === 400);

  // 10. POST /products invalid price (400)
  const invalidPriceRes = await request(
    { host: 'localhost', port: 5000, path: '/products', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Bad Price', description: 'Test', price: -50, category: 'Electronics', image: 'https://example.com/img.jpg', stock: 10 }
  );
  test('POST /products returns 400 when price <= 0', invalidPriceRes.status === 400);

  // 11. POST /products invalid stock (400)
  const invalidStockRes = await request(
    { host: 'localhost', port: 5000, path: '/products', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Bad Stock', description: 'Test', price: 999, category: 'Electronics', image: 'https://example.com/img.jpg', stock: -1 }
  );
  test('POST /products returns 400 when stock < 0', invalidStockRes.status === 400);

  // 12. POST /products successful creation (201)
  const createRes = await request(
    { host: 'localhost', port: 5000, path: '/products', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { 
      name: 'Studio Condenser Microphone', 
      description: 'Cardioid USB studio condenser microphone with pop filter and shock mount.', 
      price: 3499, 
      category: 'Electronics', 
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', 
      stock: 15 
    }
  );
  test('POST /products returns 201 with created product', createRes.status === 201 && createRes.body?.product?.name === 'Studio Condenser Microphone');

  console.log('=============================================');
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('=============================================');
}

runTests().catch(console.error);
