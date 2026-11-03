async function testServerApis() {
  const base = 'http://localhost:3000';

  console.log('1. Testing search for Mac mini ,m6 ...');
  const searchRes = await fetch(`${base}/api/search?q=${encodeURIComponent('Mac mini ,m6')}`);
  const searchData = await searchRes.json();
  console.log('Search total found:', searchData.totalFound);
  console.log('Top 3:');
  searchData.top3.forEach(t => console.log(`  [${t.crown}] ৳${t.price} | Store: ${t.source} | Title: ${t.title}`));

  console.log('\n2. Testing get subscribers...');
  const subRes = await fetch(`${base}/api/alerts/subscribers`);
  const subData = await subRes.json();
  console.log('Subscribers:', subData.subscribers);

  console.log('\n3. Testing subscribe email...');
  const addRes = await fetch(`${base}/api/alerts/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'client.vip@gmail.com' })
  });
  const addData = await addRes.json();
  console.log('Add response:', addData.message, 'Current subscribers:', addData.subscribers);

  console.log('\n4. Testing trigger alert...');
  const trigRes = await fetch(`${base}/api/alerts/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Apple Mac Mini M6 Chip With 12-core CPU/GPU',
      store: 'Dazzle BD',
      price: 109990,
      oldPrice: 159990
    })
  });
  const trigData = await trigRes.json();
  console.log('Trigger response:', trigData.message);

  console.log('\n5. Testing unsubscribe email...');
  const delRes = await fetch(`${base}/api/alerts/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'client.vip@gmail.com' })
  });
  const delData = await delRes.json();
  console.log('Del response:', delData.message, 'Remaining:', delData.subscribers);
}

testServerApis();
