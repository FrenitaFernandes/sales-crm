(async ()=>{
  const fetch = global.fetch || (await import('node-fetch')).default;
  const url = 'http://localhost:5000/api/admin/service-requests-simple';
  const body = {
    customerId: '696dd3bfec3c415336ad843b',
    ticketId: 'TKT-TEST-JSON',
    subject: 'JSON test',
    category: 'Testing',
    title: 'JSON created title',
    description: 'Created via JSON endpoint',
    priority: 'Low',
    status: 'Open',
    enableChat: true,
    createdDate: new Date().toISOString(),
  };

  try{
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  }catch(err){
    console.error('ERR', err);
  }
})();
